import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { getMenuHtml } from "./menu";
import * as zlib from 'zlib';

// --- Interfaces ---

interface RaceSimulateHeaderData {
    max_length: number;
    version: number;
}

interface RaceSimulateHorseFrameData {
    distance: number;
    lane_position: number;
    speed: number;
    hp: number;
    temptation_mode: number;
    block_front_horse_index: number;
}

interface RaceSimulateFrameData {
    time: number;
    horse_frame: RaceSimulateHorseFrameData[];
}

interface RaceSimulateHorseResultData {
    finish_order: number;
    finish_time: number;
    finish_diff_time: number;
    start_delay_time: number;
    guts_order: number;
    wiz_order: number;
    last_spurt_start_distance: number;
    running_style: number;
    defeat: number;
    finish_time_raw: number;
}

interface RaceSimulateEventData {
    frame_time: number;
    type: number;
    param_count: number;
    param: number[];
}

interface RaceSimulateEventDataWrapper {
    event_size: number;
    event: RaceSimulateEventData;
}

interface RaceSimulateData {
    header: RaceSimulateHeaderData;
    distance_diff_max: number;
    horse_num: number;
    horse_frame_size: number;
    horse_result_size: number;
    __padding_size_1: number;
    frame_count: number;
    frame_size: number;
    frame: RaceSimulateFrameData[];
    __padding_size_2: number;
    horse_result: RaceSimulateHorseResultData[];
    __padding_size_3: number;
    event_count: number;
    event: RaceSimulateEventDataWrapper[];
}

// --- Binary Reader Helper ---

class BufferReader {
    private buffer: Buffer;
    private offset: number = 0;

    constructor(buffer: Buffer) {
        this.buffer = buffer;
    }

    get position(): number { return this.offset; }
    set position(val: number) { this.offset = val; }

    readInt32(): number { const v = this.buffer.readInt32LE(this.offset); this.offset += 4; return v; }
    readSingle(): number { const v = this.buffer.readFloatLE(this.offset); this.offset += 4; return v; }
    readUInt16(): number { const v = this.buffer.readUInt16LE(this.offset); this.offset += 2; return v; }
    readInt16(): number { const v = this.buffer.readInt16LE(this.offset); this.offset += 2; return v; }
    readSByte(): number { const v = this.buffer.readInt8(this.offset); this.offset += 1; return v; }
    readByte(): number { const v = this.buffer.readUInt8(this.offset); this.offset += 1; return v; }

    seek(offset: number, origin: 'Current' | 'Begin' = 'Begin') {
        if (origin === 'Current') this.offset += offset;
        else this.offset = offset;
    }
}

// --- Logic ---

function deserializeRaceScenario(buffer: Buffer): RaceSimulateData {
    const reader = new BufferReader(buffer);
    const data = {} as RaceSimulateData;

    // Header
    const header = {} as RaceSimulateHeaderData;
    header.max_length = reader.readInt32();
    header.version = reader.readInt32();
    reader.position = 4 + header.max_length; // reader.BaseStream.Position = 4 + header.max_length;
    data.header = header;

    data.distance_diff_max = reader.readSingle();
    data.horse_num = reader.readInt32();
    data.horse_frame_size = reader.readInt32();
    data.horse_result_size = reader.readInt32();
    
    data.__padding_size_1 = reader.readInt32();
    reader.seek(data.__padding_size_1, 'Current');

    data.frame_count = reader.readInt32();
    data.frame_size = reader.readInt32();
    data.frame = [];

    for (let i = 0; i < data.frame_count; i++) {
        const frameStart = reader.position;
        const frame = {} as RaceSimulateFrameData;
        frame.time = reader.readSingle();
        frame.horse_frame = [];

        for (let h = 0; h < data.horse_num; h++) {
            const horseStart = reader.position;
            const hf = {} as RaceSimulateHorseFrameData;
            hf.distance = reader.readSingle();
            hf.lane_position = reader.readUInt16();
            hf.speed = reader.readUInt16();
            hf.hp = reader.readUInt16();
            hf.temptation_mode = reader.readSByte();
            hf.block_front_horse_index = reader.readSByte();

            const consumed = reader.position - horseStart;
            const skip = data.horse_frame_size - consumed;
            if (skip > 0) reader.seek(skip, 'Current');

            frame.horse_frame.push(hf);
        }
        reader.position = frameStart + data.frame_size;
        data.frame.push(frame);
    }

    data.__padding_size_2 = reader.readInt32();
    reader.seek(data.__padding_size_2, 'Current');
    data.horse_result = [];

    for (let i = 0; i < data.horse_num; i++) {
        const resStart = reader.position;
        const hr = {} as RaceSimulateHorseResultData;
        hr.finish_order = reader.readInt32();
        hr.finish_time = reader.readSingle();
        hr.finish_diff_time = reader.readSingle();
        hr.start_delay_time = reader.readSingle();
        hr.guts_order = reader.readByte();
        hr.wiz_order = reader.readByte();
        hr.last_spurt_start_distance = reader.readSingle();
        hr.running_style = reader.readByte();
        hr.defeat = reader.readInt32();
        hr.finish_time_raw = reader.readSingle();

        reader.position = resStart + data.horse_result_size;
        data.horse_result.push(hr);
    }

    data.__padding_size_3 = reader.readInt32();
    reader.seek(data.__padding_size_3, 'Current');
    data.event = [];
    data.event_count = reader.readInt32();

    for (let i = 0; i < data.event_count; i++) {
        const wrapper = {} as RaceSimulateEventDataWrapper;
        wrapper.event_size = reader.readInt16();
        const eventStart = reader.position;

        const ev = {} as RaceSimulateEventData;
        ev.frame_time = reader.readSingle();
        ev.type = reader.readSByte();
        ev.param_count = reader.readSByte();
        ev.param = [];
        for (let j = 0; j < ev.param_count; j++) {
            ev.param.push(reader.readInt32());
        }

        wrapper.event = ev;
        reader.position = eventStart + wrapper.event_size;
        data.event.push(wrapper);
    }

    return data;
}

// --- HTML Template ---

function pageHtml(): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Race Scenario Deserializer</title>
<style>
:root {
  --bg: #0f1220;
  --panel: #161a2e;
  --border: #2a3157;
  --text: #e6e9ff;
  --muted: #9aa3c7;
  --accent: #6aa0ff;
  --code-bg: #0b0f22;
  --danger: #ff6573;
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
  color: var(--accent);
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
textarea:focus { outline: none; border-color: var(--accent); }
.button {
  appearance: none;
  border: none;
  background: var(--accent);
  color: #fff;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 600;
  align-self: flex-start;
}
.button:hover { opacity: 0.9; }
.json-output {
  width: 100%;
  height: 400px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid var(--border);
  background: var(--code-bg);
  color: #a5b3ce;
  font-family: monospace;
  overflow: auto;
  white-space: pre-wrap;
}
.error-msg {
  color: var(--danger);
  padding: 12px;
  border: 1px solid var(--danger);
  border-radius: 8px;
  background: rgba(255, 101, 115, 0.1);
  display: none;
}
</style>
</head>
<body>
${getMenuHtml()}
<div class="layout">
  <div class="header">
    <div class="brand">Race Scenario Deserializer</div>
  </div>
  
  <div class="card">
    <label for="inputData">Encoded Data (Base64 Gzipped)</label>
    <textarea id="inputData" placeholder="Paste base64 string here..."></textarea>
    <button id="deserializeBtn" class="button">Deserialize</button>
    <div id="errorMsg" class="error-msg"></div>
  </div>

  <div class="card">
    <label>JSON Output</label>
    <div id="output" class="json-output">JSON output will appear here...</div>
  </div>
</div>

<script>
document.getElementById('deserializeBtn').addEventListener('click', async () => {
    const input = document.getElementById('inputData').value.trim();
    const output = document.getElementById('output');
    const errorMsg = document.getElementById('errorMsg');
    
    output.textContent = 'Processing...';
    errorMsg.style.display = 'none';

    try {
        const res = await fetch('/web/race-analyzer', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: input })
        });
        
        const json = await res.json();
        
        if (!res.ok) throw new Error(json.error || 'Unknown error');
        
        output.textContent = JSON.stringify(json, null, 2);
    } catch (e) {
        errorMsg.textContent = e.message;
        errorMsg.style.display = 'block';
        output.textContent = 'Error occurred.';
    }
});
</script>
</body>
</html>`;
}

// --- Routes ---

export default async function routes(fastify: FastifyInstance) {
    fastify.get("/race-analyzer", async (_req: FastifyRequest, reply: FastifyReply) => {
        reply.header("content-type", "text/html; charset=utf-8").send(pageHtml());
    });

    fastify.post("/race-analyzer", async (req: FastifyRequest, reply: FastifyReply) => {
        const body = req.body as any;
        if (!body || !body.data) {
            return reply.code(400).send({ error: "Missing data" });
        }

        try {
            // 1. Decode Base64
            // The input string might have quotes, clean it up
            const cleanInput = body.data.replace(/"/g, '');
            const buffer = Buffer.from(cleanInput, 'base64');
            
            // 2. Gunzip
            const decompressed = zlib.gunzipSync(buffer);
            
            // 3. Deserialize
            const result = deserializeRaceScenario(decompressed);
            
            return reply.send(result);
        } catch (err) {
            console.error(err);
            return reply.code(500).send({ error: "Failed to process data"});
        }
    });
}
