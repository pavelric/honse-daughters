import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

function pageHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Database Admin</title>
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
}
* { box-sizing: border-box }
html, body { height: 100% }
body {
  margin: 0;
  background: var(--bg);
  color: var(--text);
  font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Ubuntu, Cantarell, Noto Sans, Arial, Apple Color Emoji, Segoe UI Emoji;
}
.layout {
  display: grid;
  grid-template-columns: 280px 1fr;
  height: 100%;
}
.sidebar {
  border-right: 1px solid var(--border);
  background: var(--panel);
  padding: 16px;
  overflow: auto;
}
.brand {
  font-weight: 700;
  letter-spacing: 0.2px;
  margin-bottom: 16px;
}
.search {
  margin-bottom: 12px;
}
.search input {
  width: 100%;
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: #0d1020;
  color: var(--text);
}
.table-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.table-item {
  padding: 8px 10px;
  border-radius: 6px;
  border: 1px solid transparent;
  cursor: pointer;
  color: var(--muted);
}
.table-item:hover { border-color: var(--border); color: var(--text) }
.table-item.active { background: #0d1020; border-color: var(--border); color: var(--text) }
.content {
  display: grid;
  grid-template-rows: auto 1fr;
  height: 100%;
}
.toolbar {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--border);
  background: #0d1020;
}
.toolbar .title {
  font-weight: 600;
  margin-right: auto;
}
.button {
  appearance: none;
  border: 1px solid var(--border);
  background: var(--panel);
  color: var(--text);
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
}
.button:hover { border-color: var(--accent) }
.button.primary { background: linear-gradient(90deg, var(--accent), var(--accent-2)); border-color: transparent }
.button.danger { background: var(--danger); border-color: var(--danger) }
.grid {
  overflow: auto;
  padding: 16px;
}
table {
  width: 100%;
  border-collapse: collapse;
  border: 1px solid var(--border);
}
th, td {
  border: 1px solid var(--border);
  padding: 8px 10px;
  text-align: left;
  font-size: 13px;
}
th {
  position: sticky;
  top: 0;
  background: #0e1326;
  z-index: 2;
}
td[contenteditable="true"] { background: #0b0f22 }
.muted { color: var(--muted) }
.row-actions {
  display: flex;
  gap: 6px;
}
.footer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--border);
  background: #0d1020;
}
.status { color: var(--muted) }
</style>
</head>
<body>
<div class="layout">
  <aside class="sidebar">
    <div class="brand">HonseDaughters Admin</div>
    <div class="search"><input id="search" placeholder="Search tables"></div>
    <div id="tables" class="table-list"></div>
  </aside>
  <main class="content">
    <div class="toolbar">
      <div id="title" class="title">Select a table</div>
      <button id="addRow" class="button">Add Row</button>
      <button id="refresh" class="button">Refresh</button>
    </div>
    <div class="grid" id="grid"></div>
    <div class="footer">
      <div class="status" id="status">Ready</div>
      <div style="margin-left:auto; font-size:12px" class="muted">Limit <input id="limit" type="number" min="1" max="1000" value="100" style="width:80px"> Offset <input id="offset" type="number" min="0" value="0" style="width:80px"></div>
    </div>
  </main>
</div>
<script>
const state = {
  tables: [],
  active: null,
  schema: null,
  rows: [],
  limit: 100,
  offset: 0,
  editingInsert: null
};

function setStatus(text) {
  document.getElementById('status').textContent = text;
}

async function fetchTables() {
  const res = await fetch('/web_api/db/tables');
  const data = await res.json();
  state.tables = data.tables || [];
  renderTableList();
}

function renderTableList() {
  const q = document.getElementById('search').value.toLowerCase();
  const el = document.getElementById('tables');
  el.innerHTML = '';
  const filtered = state.tables.filter(t => t.toLowerCase().includes(q));
  for (const name of filtered) {
    const item = document.createElement('div');
    item.className = 'table-item' + (state.active === name ? ' active' : '');
    item.textContent = name;
    item.onclick = () => selectTable(name);
    el.appendChild(item);
  }
}

async function selectTable(name) {
  state.active = name;
  document.getElementById('title').textContent = name;
  setStatus('Loading schema');
  const s = await fetch('/web_api/db/table/' + encodeURIComponent(name) + '/schema').then(r => r.json());
  state.schema = s;
  await loadRows();
}

async function loadRows() {
  setStatus('Loading rows');
  const params = new URLSearchParams();
  params.set('limit', String(state.limit));
  params.set('offset', String(state.offset));
  const data = await fetch('/web_api/db/table/' + encodeURIComponent(state.active) + '/rows?' + params.toString()).then(r => r.json());
  state.rows = data.rows || [];
  renderGrid(data.columns, data.primaryKey);
  setStatus('Loaded ' + state.rows.length + ' of ' + data.total);
}

function renderGrid(columns, primaryKey) {
  const grid = document.getElementById('grid');
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const trh = document.createElement('tr');
  for (const c of columns) {
    const th = document.createElement('th');
    th.textContent = c;
    trh.appendChild(th);
  }
  const thAct = document.createElement('th');
  thAct.textContent = 'Actions';
  trh.appendChild(thAct);
  thead.appendChild(trh);
  table.appendChild(thead);
  const tbody = document.createElement('tbody');
  const rows = state.rows.slice();
  if (state.editingInsert) rows.unshift(state.editingInsert);
  rows.forEach((row, idx) => {
    const tr = document.createElement('tr');
    columns.forEach((c) => {
      const td = document.createElement('td');
      td.contentEditable = true;
      td.dataset.col = c;
      td.dataset.idx = String(idx);
      td.textContent = row[c] != null ? String(row[c]) : '';
      td.onblur = async (e) => {
        const col = e.target.dataset.col;
        const i = Number(e.target.dataset.idx);
        const current = rows[i];
        const val = e.target.textContent;
        if (state.editingInsert && i === 0 && current === state.editingInsert) {
          current[col] = val;
          return;
        }
        const key = {};
        if (primaryKey && primaryKey.length > 0) {
          for (const k of primaryKey) key[k] = row[k];
        } else {
          key['__rowid__'] = row['__rowid__'];
        }
        const update = {};
        update[col] = parseValue(val);
        setStatus('Updating');
        const res = await fetch('/web_api/db/table/' + encodeURIComponent(state.active) + '/row', {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ key, update })
        }).then(r => r.json());
        if (res && res.ok) {
          setStatus('Updated');
        } else {
          setStatus('Update failed');
        }
      };
      tr.appendChild(td);
    });
    const tdAct = document.createElement('td');
    const del = document.createElement('button');
    del.className = 'button danger';
    del.textContent = 'Delete';
    del.onclick = async () => {
      const key = {};
      if (primaryKey && primaryKey.length > 0) {
        for (const k of primaryKey) key[k] = row[k];
      } else {
        key['__rowid__'] = row['__rowid__'];
      }
      setStatus('Deleting');
      const res = await fetch('/web_api/db/table/' + encodeURIComponent(state.active) + '/row', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ key })
      }).then(r => r.json());
      if (res && res.ok) {
        setStatus('Deleted');
        await loadRows();
      } else {
        setStatus('Delete failed');
      }
    };
    tdAct.appendChild(del);
    tr.appendChild(tdAct);
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  grid.innerHTML = '';
  grid.appendChild(table);
}

function parseValue(v) {
  if (v === null || v === undefined) return null;
  const s = String(v).trim();
  if (s === '') return null;
  if (/^-?\\d+$/.test(s)) return Number.parseInt(s, 10);
  if (/^-?\\d+\\.\\d+$/.test(s)) return Number.parseFloat(s);
  return s;
}

document.getElementById('search').addEventListener('input', renderTableList);
document.getElementById('refresh').addEventListener('click', () => {
  if (state.active) loadRows();
});
document.getElementById('limit').addEventListener('change', (e) => {
  const v = Number(e.target.value);
  if (!isNaN(v)) state.limit = Math.min(Math.max(v, 1), 1000);
});
document.getElementById('offset').addEventListener('change', (e) => {
  const v = Number(e.target.value);
  if (!isNaN(v)) state.offset = Math.max(v, 0);
});
document.getElementById('addRow').addEventListener('click', () => {
  if (!state.active || !state.schema) return;
  const obj = {};
  for (const c of state.schema.columns.map(x => x.name)) obj[c] = '';
  state.editingInsert = obj;
  renderGrid(state.schema.columns.map(x => x.name), state.schema.primaryKey);
  const save = document.createElement('button');
  save.className = 'button primary';
  save.textContent = 'Save New Row';
  save.onclick = async () => {
    const values = {};
    for (const [k, v] of Object.entries(state.editingInsert)) values[k] = parseValue(v);
    setStatus('Inserting');
    const res = await fetch('/web_api/db/table/' + encodeURIComponent(state.active) + '/row', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ values })
    }).then(r => r.json());
    if (res && res.ok) {
      setStatus('Inserted');
      state.editingInsert = null;
      await loadRows();
    } else {
      setStatus('Insert failed');
    }
  };
  const cancel = document.createElement('button');
  cancel.className = 'button';
  cancel.textContent = 'Cancel';
  cancel.onclick = () => {
    state.editingInsert = null;
    renderGrid(state.schema.columns.map(x => x.name), state.schema.primaryKey);
  };
  const toolbar = document.querySelector('.toolbar');
  toolbar.appendChild(save);
  toolbar.appendChild(cancel);
});

fetchTables();
</script>
</body>
</html>`;
}

export default async function routes(fastify: FastifyInstance) {
  fastify.get("/db", async (_req: FastifyRequest, reply: FastifyReply) => {
    reply.header("content-type", "text/html; charset=utf-8").send(pageHtml());
  });
}
