import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { decryptRequest, decryptResponse } from "../../crypto";
import { inspect } from "util";
import { getMenuHtml } from "./menu";

function pageHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Request Decryptor</title>
<style>
:root {
  --bg: #0f1220;
  --panel: #161a2e;
  --border: #2a3157;
  --text: #e6e9ff;
  --muted: #9aa3c7;
  --accent: #6aa0ff;
  --accent-2: #8b73ff;
  --danger: #ff6573;
  --success: #5ec98b;
  --code-bg: #0b0f22;
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
  max-width: 1200px;
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
.input-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
label {
  font-weight: 600;
  color: var(--muted);
  font-size: 14px;
}
textarea {
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--code-bg);
  color: var(--text);
  font-family: monospace;
  resize: vertical;
}
input[type="text"] {
  width: 100%;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--code-bg);
  color: var(--text);
  font-family: monospace;
}
textarea:focus, input:focus {
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
  align-self: flex-start;
  transition: opacity 0.2s;
}
.button:hover { opacity: 0.9; }
.button:disabled { opacity: 0.5; cursor: not-allowed; }
.result-area {
  display: none;
  flex-direction: column;
  gap: 16px;
}
.json-viewer {
  background: var(--code-bg);
  padding: 16px;
  border-radius: 8px;
  overflow: auto;
  font-family: monospace;
  white-space: pre-wrap;
  color: #a5b3ce;
  border: 1px solid var(--border);
}
.error-msg {
  color: var(--danger);
  background: rgba(255, 101, 115, 0.1);
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--danger);
  display: none;
}
.key-value {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 8px;
  font-size: 14px;
}
.key { color: var(--muted); }
.val { font-family: monospace; }

.mode-selector {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
}
.radio-group {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}
.radio-group input { margin: 0; }
</style>
</head>
<body>
${getMenuHtml()}
<div class="layout">
  <div class="header">
    <div class="brand">HonseDaughters Decryptor</div>
    <div style="color: var(--muted); margin-top: 4px;">Decrypt game client requests and server responses</div>
  </div>

  <div class="card">
    <div class="mode-selector">
      <label class="radio-group">
        <input type="radio" name="mode" value="request" checked onchange="toggleMode()">
        Request (Client -> Server)
      </label>
      <label class="radio-group">
        <input type="radio" name="mode" value="response" onchange="toggleMode()">
        Response (Server -> Client)
      </label>
    </div>

    <div class="input-group" id="udidGroup" style="display: none;">
      <label for="udidInput">UDID (Required for Response Decryption)</label>
      <input type="text" id="udidInput" placeholder="Enter UDID (hex string)...">
      <small style="color: var(--muted)">You can find this in a decrypted request from the same session.</small>
    </div>

    <div class="input-group">
      <label for="encryptedInput">Encrypted Payload (Base64)</label>
      <textarea id="encryptedInput" placeholder="Paste the full base64 string here..."></textarea>
    </div>
    <button id="decryptBtn" class="button">Decrypt Payload</button>
    <div id="errorMsg" class="error-msg"></div>
  </div>

  <div id="resultArea" class="result-area">
    <div class="card" id="headerCard">
      <h3 style="margin:0 0 16px 0">Decrypted Header</h3>
      <div class="key-value">
        <div class="key">SID</div><div class="val" id="resSid"></div>
        <div class="key">UDID</div><div class="val" id="resUdid"></div>
        <div class="key">Auth Key</div><div class="val" id="resAuthKey"></div>
      </div>
    </div>

    <div class="card">
      <h3 style="margin:0 0 16px 0">Decrypted Content</h3>
      <div id="jsonOutput" class="json-viewer"></div>
    </div>
  </div>
</div>

<script>
const decryptBtn = document.getElementById('decryptBtn');
const input = document.getElementById('encryptedInput');
const udidInput = document.getElementById('udidInput');
const udidGroup = document.getElementById('udidGroup');
const resultArea = document.getElementById('resultArea');
const errorMsg = document.getElementById('errorMsg');
const jsonOutput = document.getElementById('jsonOutput');
const resSid = document.getElementById('resSid');
const resUdid = document.getElementById('resUdid');
const resAuthKey = document.getElementById('resAuthKey');
const headerCard = document.getElementById('headerCard');

function toggleMode() {
  const mode = document.querySelector('input[name="mode"]:checked').value;
  if (mode === 'response') {
    udidGroup.style.display = 'flex';
    headerCard.style.display = 'none';
  } else {
    udidGroup.style.display = 'none';
    headerCard.style.display = 'flex';
  }
}

decryptBtn.addEventListener('click', async () => {
  const payload = input.value.trim();
  const mode = document.querySelector('input[name="mode"]:checked').value;
  const udid = udidInput.value.trim();

  if (!payload) return;
  if (mode === 'response' && !udid) {
    alert("UDID is required for response decryption");
    return;
  }

  decryptBtn.disabled = true;
  errorMsg.style.display = 'none';
  resultArea.style.display = 'none';

  try {
    const res = await fetch('/web/decrypt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ payload, mode, udid })
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Decryption failed');
    }

    if (mode === 'request') {
        resSid.textContent = data.header.sid;
        resUdid.textContent = data.header.udid;
        resAuthKey.textContent = data.header.authKey;
    }
    
    jsonOutput.textContent = JSON.stringify(data.content, null, 2);
    resultArea.style.display = 'flex';
  } catch (err) {
    errorMsg.textContent = err.message;
    errorMsg.style.display = 'block';
  } finally {
    decryptBtn.disabled = false;
  }
});
</script>
</body>
</html>`;
}

function replacer(key: string, value: any) {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  return value;
}

export default async function routes(fastify: FastifyInstance) {
  fastify.get("/decrypt", async (_req: FastifyRequest, reply: FastifyReply) => {
    reply.header("content-type", "text/html; charset=utf-8").send(pageHtml());
  });

  fastify.post("/decrypt", async (req: FastifyRequest, reply: FastifyReply) => {
    const body = req.body as any;
    let payload: string = "";
    let mode: "request" | "response" = "request";
    let udid: string = "";

    // Robust payload extraction
    if (body && typeof body.payload === 'string') {
      payload = body.payload;
      mode = body.mode || "request";
      udid = body.udid || "";
    } else if (typeof body === 'string') {
      payload = body;
    } else {
      console.log("Invalid body received:", body);
      return reply.code(400).send({ error: "Invalid request body." });
    }

    // Clean up payload
    payload = payload.trim();
    udid = udid.trim();

    console.log(`Decrypting ${mode} payload (length: ${payload.length}): ${payload.substring(0, 20)}...`);

    try {
      if (mode === 'response') {
        if (!udid) throw new Error("UDID is required for response decryption");
        const decrypted = decryptResponse(payload, udid);
        
        // Use JSON.parse(JSON.stringify(..., replacer)) to handle BigInts
        // Or better yet, just let reply.send handle it if we can configure serialization,
        // but since we can't easily change global config, we'll serialize manually first.
        const responseContent = JSON.parse(JSON.stringify(decrypted.content, replacer));

        return reply.send({
          content: responseContent,
          key: decrypted.key
        });
      } else {
        const decrypted = decryptRequest(payload);
        const responseContent = JSON.parse(JSON.stringify(decrypted.content, replacer));

        const response = {
          header: {
            sid: decrypted.header.sid,
            udid: decrypted.header.udid,
            authKey: decrypted.header.authKey.toString('hex'),
            requestKey: decrypted.header.requestKey.toString('hex')
          },
          content: responseContent
        };
        return reply.send(response);
      }
    } catch (error) {
      console.error("Decryption error:", error);
      return reply.code(400).send({ error: (error as Error).message });
    }
  });
}
