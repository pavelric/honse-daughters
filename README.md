# Honse Daughters

A work-in-progress server emulator for the global version of a horse racing game.

It reimplements the game's HTTP API from observed traffic and stands in for the asset CDN, so that an
unmodified, legitimately installed client can be pointed at a server you run yourself.

## Scope

This is a preservation and interoperability project. It contains **no game assets (kinda), no client code and no
publisher data** — only a reimplementation of the network protocol, plus tooling that reads the data files
already present on your own machine after you install the game normally.

Anything you run this against, you bring yourself:

* your own installed client,
* your own copy of the client's master database,
* your own downloaded assets.

Running a private server is very likely contrary to the game's terms of service. Use it on your own
installation, offline, and don't host it publicly or use it to circumvent purchases.

## Implemented Features

* CDN serving — mostly working; the one full test run was buggy but completed
* Login and registration
* Gacha
* Presents (partial — only carats among reward types are properly supported)
* Tutorial flow, including skip
* Support card strengthen / limit break / deck editing
* Team stadium flow (canned responses)
* Jukebox
* Career/training mode — **not working yet**, in progress

## Requirements

| | |
|---|---|
| Node.js | 20.6+ (uses `node --env-file`); developed on 22.x |
| Python | 3.10+ (uses `match` statements); developed on 3.12 |
| mitmproxy | 12+, installed to `C:\Program Files\mitmproxy` if you want the `.bat` launchers to find it |
| OS | Developed on Windows. The server itself is portable; the launchers and the master-database paths are Windows-specific. |
| Disk | Tens of GB if you mirror the CDN. |

`better-sqlite3` is a native module, so `npm install` needs a working toolchain (on Windows, either a
prebuilt binary for your Node version or Visual Studio Build Tools).

## Installation

### 1. Server

```bash
git clone <this repo>
cd honsedaughter
npm install
```

Create a `.env` in the repository root:

```
LISTEN_HOST=localhost
LISTEN_PORT=8000
CDN_DIR=.cdn
```

`CDN_DIR` may be relative (resolved against the repo root) or absolute — useful when the mirrored assets
live on another drive.

Then build and run:

```bash
npm run dev
```

On first start it creates `.database/honse_data.db` and applies the schema from `src/data/db-init.ts`.
Visit <http://localhost:8000/> to confirm it's up.

### 2. Python tooling

The scripts under `scripts/` are only needed to populate game data and mirror the CDN.

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r scripts/requirements.txt
```

### 3. Game data

The server needs a handful of JSON files under `assets/`, extracted from the master database that the
client downloads to:

```
%LOCALAPPDATA%\..\LocalLow\Cygames\Umamusume\master\master.mdb
```

Each script in `scripts/masterdb/` dumps one table to one file. Run them after installing (or updating)
the client:

```bash
python scripts/masterdb/build_card_data.py                  # -> assets/umas_data.json
python scripts/masterdb/build_card_rarity_data.py           # -> assets/umas_rarity_data.json
python scripts/masterdb/build_gacha_data.py                 # -> assets/gacha_data.json
python scripts/masterdb/build_goals_data.py                 # -> assets/umas_route_race_data.json
python scripts/masterdb/build_jukebox_data.py               # -> assets/jukebox_request_data.json
python scripts/masterdb/build_single_mode_program_data.py   # -> assets/single_mode_program_data.json
python scripts/masterdb/build_support_card_data.py          # -> assets/support_cards_data.json
python scripts/masterdb/build_support_card_effect_table.py  # -> assets/support_cards_effect_table_data.json
python scripts/masterdb/build_support_card_level_data.py    # -> assets/support_cards_level_data.json
```

`build_skills_data.py`, `build_factors_data.py` and `build_career_races_data.py` write `_*.json` scratch
files next to the script; they're for inspection and aren't read by the server. `list_tables.py` prints the
tables available in the master database, which is the starting point for writing a new extractor.

Don't hand-edit the generated JSON — re-run the script instead.

### 4. CDN mirror

```bash
python scripts/cdn_download.py
```

It prompts for a platform (`android` / `windows` / all) and a language (`en` / `jp` / all), reads the
corresponding index from `assets/asset_lists/`, and downloads every blob into
`.cdn/<index-name>/`, mirroring the upstream URL layout. Files are stored still compressed, because that's
what the client expects. Already-downloaded files are skipped, so an interrupted run can simply be
restarted.

The server currently serves **`.cdn/en-android-meta/`** at `/assets/dl/vertical`, so an Android client
needs at least the `en` + `android` combination.

Two things to know:

* The upstream CDN returns 403 for a good number of paths; those are logged and skipped. A run that ends
  with failures is normal, not necessarily broken.
* `resVer` at the top of `cdn_download.py` must match the resource version the server reports to the
  client (`10003850`, hardcoded in several places in `src/routes/api/tool.ts`). If you bump one, bump the
  other.

## Usage

### Running

`start.bat` and `start_pc.bat` each open two windows — the server (`npx tsc && npm run dev`) and mitmweb
with `scripts/mitm-redirect-traffic.py` loaded. They differ only in the interception mode:

* **`start.bat`** — `--mode wireguard`, for a phone or emulator that connects to your machine over a
  WireGuard tunnel.
* **`start_pc.bat`** — `--mode local`, for a client running on the same machine.

To run things by hand instead:

```bash
npm run dev
```

```bash
mitmweb --mode wireguard --set connection_strategy=lazy -s scripts/mitm-redirect-traffic.py
```

### Pointing a client at the server

`scripts/mitm-redirect-traffic.py` answers DNS queries for the API and asset hostnames with a black-holed
address, then rewrites the matching HTTP flows to `localhost:8000`, prefixing asset requests with
`/assets`. Its `API_HOST` / `API_PORT` constants are hardcoded — keep them in sync with your `.env`.

For a device over WireGuard:

1. Start with `start.bat`.
2. In mitmweb, open the WireGuard configuration and scan the QR code from the WireGuard app on the device.
3. Install and trust the mitmproxy CA certificate on the device (visit `mitm.it` through the tunnel). This
   is required because the API is HTTPS; the script downgrades the redirected flow to plain HTTP toward
   your server.
4. Bring the tunnel up and launch the client.

For a client on the same PC, `start_pc.bat` and a trusted mitmproxy CA in the Windows certificate store are
enough.

If the client still reaches the real servers, check the mitmweb log — the script logs every host it does
and doesn't redirect.

### First run

Launch the client against the server and it will go through `pre_signup` → `signup` → `start_session`,
which creates an account keyed by the device's UDID, then a player row and a session. From there the
tutorial flow is implemented, and `tutorial/skip` works if you'd rather jump straight in.

Session IDs and the request/response encryption are described in `BasicClientServerRundown.md` if you need
to debug at the wire level.

### Web tools

The server hosts a small admin UI (dark, no auth — bind it to localhost):

| Path | What it does |
|---|---|
| `/web/accounts` | Lists accounts; generates up to 1000 filler accounts with random UDIDs, for populating opponent lists |
| `/web/db` | Browse, edit, insert and delete rows in any table of the server database |
| `/web/decrypt` | Paste a captured base64 payload and decode it. Requests decode on their own; responses need the UDID, since the IV is derived from it |
| `/web/race-analyzer` | Decode a gzipped base64 race scenario blob into readable frame/result data |
| `/web/present` | Inspect presents and broadcast one (reward type, id, count, message, validity in days) to every account |

The database browser and the present broadcaster write directly to the database with no confirmation
step. Treat them as developer tools.

### Other scripts

```bash
python scripts/lz4_decompress.py <file.lz4> [-o out]   # unpack a manifest or asset
python scripts/decryptor.py                            # dump SaveData.db (expects it in the CWD)
```

## Troubleshooting

**The server starts but the client hangs on the title screen.** Almost always interception, not the
server. Confirm mitmweb shows the game's requests, and that they're being rewritten rather than passed
through.

**The client re-downloads assets forever / errors during download.** The resource version the server
reports doesn't match what's in `.cdn/`, or the mirror is incomplete for that version.

**A schema change doesn't take effect.** `src/data/db-init.ts` is `CREATE TABLE IF NOT EXISTS` only —
there are no migrations. Delete `.database/honse_data.db` (plus its `-wal`/`-shm` siblings) and let it be
recreated.

**`npm install` fails on `better-sqlite3`.** No prebuilt binary for your Node version; either install the
build tools or drop to a Node release that has one.

**Requests fail to decrypt.** The UDID must be a hex string of at least 16 characters — see
`normalizeUdid` in `src/crypto.ts`. Note also that if response encryption throws, the server falls back to
sending the payload unencrypted rather than erroring, which makes a broken response look like a client-side
bug.


## Acknowledgements

* Duosii's Starpoint project (https://github.com/duosii/starpoint), which did all the main heavy lifting
  and was the main foundation for this project, tech-wise.
