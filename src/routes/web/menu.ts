
export function getMenuHtml(): string {
  return `
<style>
.nav-menu {
  display: flex;
  gap: 4px;
  background: #161a2e;
  border-bottom: 1px solid #2a3157;
  padding: 0 16px;
  margin-bottom: 0;
}
.nav-item {
  padding: 12px 16px;
  color: #9aa3c7;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  border-bottom: 2px solid transparent;
  transition: all 0.2s;
}
.nav-item:hover {
  color: #e6e9ff;
  background: rgba(255,255,255,0.03);
}
.nav-item.active {
  color: #6aa0ff;
  border-bottom-color: #6aa0ff;
}
</style>
<nav class="nav-menu">
  <a href="/" class="nav-item" id="nav-home">Home</a>
  <a href="/web/db" class="nav-item" id="nav-db">Database</a>
  <a href="/web/decrypt" class="nav-item" id="nav-decrypt">Decryptor</a>
  <a href="/web/race-analyzer" class="nav-item" id="nav-race">Race Analyzer</a>
  <a href="/web/present/admin" class="nav-item" id="nav-presents">Presents</a>
</nav>
<script>
(function() {
  const path = window.location.pathname;
  if (path === '/') document.getElementById('nav-home').classList.add('active');
  else if (path.startsWith('/web/db')) document.getElementById('nav-db').classList.add('active');
  else if (path.startsWith('/web/decrypt')) document.getElementById('nav-decrypt').classList.add('active');
  else if (path.startsWith('/web/race-analyzer')) document.getElementById('nav-race').classList.add('active');
  else if (path.startsWith('/web/present')) document.getElementById('nav-presents').classList.add('active');
})();
</script>
`;
}
