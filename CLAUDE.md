# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

HonseDaughters is a private server emulator of a horse racing global game, created as part of a conservation project. It reimplements the game's HTTP API *and* stands in for the Akamai asset CDN, so an unmodified client can be pointed at it via a mitmproxy DNS/host redirect.

Heavily inspired by / built on knowledge from Duosii's [starpoint](https://github.com/duosii/starpoint) project.

## Commands

```bash
npm run build          # npx tsc -> dist/
npm run dev            # build + node --env-file=.env dist/server.js
```

`npm test` is not wired up (exits 1). There is no linter and no test suite.

`start.bat` launches the server *and* mitmweb in WireGuard mode (for a phone/emulator client); `start_pc.bat` is the same but uses mitmproxy `--mode local` (for the Windows client on the same machine). Both expect mitmproxy at `C:\Program Files\mitmproxy`.

Python tooling (CDN download, master.mdb extraction) uses `.venv` and `scripts/requirements.txt`.

`.env` holds `LISTEN_HOST`, `LISTEN_PORT` (default 8000), `CDN_DIR` (default `.cdn`).

## Request/response pipeline
Everything the client sends is an encrypted, msgpack-encoded blob. `src/server.ts` wires this up so that route handlers only ever see plain JS objects:

- A `application/x-msgpack` **content-type parser** calls `decryptRequest()` (`src/crypto.ts`), stashes the parsed `UmaHeader` on `request.umaHeader`, and hands the decoded body to the route.
- An **`onSend` hook** re-encrypts any reply whose content-type is exactly `application/x-msgpack; charset=utf-8`, using `request.umaHeader.udid` + `requestKey`. If the header is missing it falls back to bare base64 msgpack; if encryption throws it silently sends the payload unchanged.

So: **a route that wants to talk to the game must set `reply.header("content-type", "application/x-msgpack; charset=utf-8")`** before sending, and send a plain object. Never encrypt or msgpack inside a route.

Wire format (documented in detail, with the reverse-engineered C# original, in `BasicClientServerRundown.md`):

```
base64( [len:u32le][commonHeader:52][binarySid:16][binaryUdid:16][authKey][random:32][AES-CBC(content)][key:32] )
```

The AES-256-CBC IV is the first 16 chars of the hyphen-less UDID, so it is constant per account; the key is fresh per request and appended in cleartext at the end of the payload. Responses drop the header block: `base64([len][encrypted][key])`.

Session IDs: `computeResponseSid()` in `src/crypto.ts` hashes `sid + EN_SALT` (salt extracted from the client binary). The client derives its own first SID as `MD5(viewer_id + udid + salt)` and subsequent ones from the server-returned SID.

## Layout

- `src/server.ts` — Fastify bootstrap, crypto hooks, route registration, static CDN mount at `/assets/dl/vertical` (served from `${CDN_DIR}/en-android-meta`, with CORS + range support because the client streams bundles).
- `src/routes/api/*.ts` — one Fastify plugin per game API namespace, registered under `/umamusume/<namespace>`. Each file default-exports `async (fastify) => { ... }`.
- `src/routes/web/*.ts`, `src/routes/web_api/*.ts` — server-rendered admin/debug UI (accounts, DB browser, payload decryptor, race scenario analyzer, present sender) under `/web` and `/web_api`. Pages compose `getMenuHtml()` from `src/routes/web/menu.ts` and inline their own CSS in the same dark palette.
- `src/data/` — the persistence layer:
  - `index.ts` opens/caches the SQLite DB (`better-sqlite3`, WAL, foreign keys on) at `.database/honse_data.db`.
  - `db-init.ts` is the entire schema, expressed as idempotent `CREATE TABLE IF NOT EXISTS`. **There are no migrations** — changing a column means deleting `.database/honse_data.db` and letting it rebuild.
  - `honseData.ts` — all account/player/inventory queries and mutations (the "repository").
  - `utils.ts` — assembles the large client-facing payloads (`getClientSerializedData`, `constructClientUserInfo`, `buildSummaryUserInfo`, …).
  - `defaults.ts` — big literal blobs for a freshly created account and hardcoded client constants (`COMMON_DEFINE`, released card array, etc.).
  - `honseTraining.ts` — career/training-mode logic (WIP, not working yet).
- `src/utils.ts` — `generateDataHeaders()` builds the `data_headers` envelope every response needs, plus server-time helpers (server time is overridable via `setServerTime` for testing time-gated content).

Responses follow the game's envelope: `{ data, data_headers: generateDataHeaders({...}), response_code: 1 }`.

## Game data assets

`assets/*.json` are extracted from the client's `master.mdb` (`%LOCALAPPDATA%\..\LocalLow\..\master\master.mdb`) by the scripts in `scripts/masterdb/`. Each `build_*.py` dumps one table to one JSON file; run the relevant script after a client data update rather than hand-editing the JSON. Scripts whose `OUTPUT_FILE` is a bare `_*.json` filename (skills, factors, career races) are scratch dumps, not consumed by the server.

Server code loads these lazily and caches them in module-level variables, resolving paths from `process.cwd()` (`honseTraining.ts`) or `__dirname` (`routes/api/*`) — note the inconsistency when adding new loaders.

`scripts/cdn_download.py` mirrors the live CDN into `.cdn/` using the encrypted asset-list SQLite DBs in `assets/asset_lists/` (opened with `apsw-sqlite3mc` + the hardcoded keys). `scripts/mitm-redirect-traffic.py` rewrites DNS answers and requests for `api.games.umamusume.com` and `assets-umamusume-en.akamaized.net` to `localhost:8000`.

## Reference material

- `.requestsexamples/` (gitignored) — captured request/response pairs for real client flows, numbered in the order the client issues them. This is the source of truth for what a response must contain; consult the matching capture before implementing or changing an endpoint.
- `BasicClientServerRundown.md` — crypto/wire format writeup.
- `Plan.md` (gitignored) — MITM + CDN emulation plan.
- `RaceUtils.cs` / `assets/RaceScenarioViewer.exe` — reference implementation of the gzip+base64 race scenario binary format, mirrored in TypeScript in `src/routes/web/raceAnalyzer.ts`.

## Conventions in this codebase

- Fastify plugins, not classes. Handlers are inline; validation is manual (`if (!viewer_id) return reply.status(400).send(...)`) — there are no schemas.
- Sessions are checked with `verifySession(viewerId)` from `data/honseData.ts` at the top of authenticated endpoints.
- Route handlers log request body and response to console; the Fastify logger is on. Expect verbose output.
- Resource version is hardcoded in several places in `routes/api/tool.ts` (currently `10003850`, deliberately different from live to force a CDN redownload through this server) — change all of them together.
