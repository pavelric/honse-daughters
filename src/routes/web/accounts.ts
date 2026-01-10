import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { randomBytes } from "crypto";
import { createAccount, getAccountByUdid } from "../../data/honseData";
import { getMenuHtml } from "./menu";

function pageHtml(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Accounts Admin</title>
<style>
:root {
  --bg: #0f1220;
  --panel: #161a2e;
  --border: #2a3157;
  --text: #e6e9ff;
  --muted: #9aa3c7;
  --accent: #6aa0ff;
  --accent-2: #8b73ff;
}
* { box-sizing: border-box }
html, body { height: 100% }
body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial, Apple Color Emoji, Segoe UI Emoji;
  display: flex;
  flex-direction: column;
}
.layout {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  gap: 20px;
}
.header {
  border-bottom: 1px solid var(--border);
  padding-bottom: 16px;
  margin-bottom: 16px;
}
.brand {
  font-size: 24px;
  font-weight: 700;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.form-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  align-items: end;
}
label {
  font-weight: 600;
  color: var(--muted);
  font-size: 14px;
}
input[type="number"] {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: #0b0f22;
  color: var(--text);
}
input:focus {
  outline: none;
  border-color: var(--accent);
}
.button {
  appearance: none;
  border: none;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
  color: #fff;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  transition: opacity 0.2s;
}
.button:hover { opacity: 0.9; }
.muted { color: var(--muted); font-size: 12px; }
</style>
</head>
<body>
${getMenuHtml()}
<div class="layout">
  <div class="header">
    <div class="brand">Generate NPC Accounts</div>
    <div style="color: var(--muted); margin-top: 4px;">Create multiple accounts with randomized UDIDs</div>
  </div>
  <div class="card">
    <form action="/web/accounts/generate" method="POST">
      <div class="form-row">
        <div>
          <label for="count">Number of accounts</label>
          <input id="count" name="count" type="number" min="1" max="1000" value="20" required>
          <div class="muted">A randomized UDID is generated for each account</div>
        </div>
        <button type="submit" class="button">Generate NPCs Accounts</button>
      </div>
    </form>
  </div>
</div>
</body>
</html>`;
}

function randomUdid(): string {
    return randomBytes(16).toString("hex");
}

export default async function routes(fastify: FastifyInstance) {
    fastify.get("/", async (_req: FastifyRequest, reply: FastifyReply) => {
        reply.header("content-type", "text/html; charset=utf-8").send(pageHtml());
    });

    fastify.post("/generate", async (request: FastifyRequest, reply: FastifyReply) => {
        const body = request.body as any;
        const n = Number.parseInt(body?.count ?? "0");
        const count = isNaN(n) ? 0 : Math.max(1, Math.min(n, 1000));
        let created = 0;
        for (let i = 0; i < count; i++) {
            let udid = randomUdid();
            while (getAccountByUdid(udid)) {
                udid = randomUdid();
            }
            createAccount(udid);
            created++;
        }
        const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Accounts Generated</title>
<style>
:root {
  --bg: #0f1220;
  --panel: #161a2e;
  --border: #2a3157;
  --text: #e6e9ff;
  --muted: #9aa3c7;
  --accent: #6aa0ff;
  --accent-2: #8b73ff;
}
* { box-sizing: border-box }
html, body { height: 100% }
body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial, Apple Color Emoji, Segoe UI Emoji;
  display: flex;
  flex-direction: column;
}
.layout {
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  gap: 20px;
  align-items: center;
  justify-content: center;
}
.card {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 40px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: center;
  max-width: 500px;
  width: 100%;
}
.button {
  appearance: none;
  border: none;
  background: linear-gradient(90deg, var(--accent), var(--accent-2));
  color: #fff;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  text-decoration: none;
  display: inline-block;
  transition: opacity 0.2s;
}
.button:hover { opacity: 0.9; }
</style>
</head>
<body>
${getMenuHtml()}
<div class="layout">
  <div class="card">
    <h1>Success</h1>
    <p>Generated ${created} NPC accounts.</p>
    <div><a href="/web/accounts" class="button">Generate More</a></div>
  </div>
</div>
</body>
</html>`;
        reply.header("content-type", "text/html; charset=utf-8").send(html);
    });
}
