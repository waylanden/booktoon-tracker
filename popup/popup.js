/*
  Log viewer pour la popup.
  - Récupère les logs via chrome.runtime.sendMessage.
  - Permet d'effacer et d'exporter.
*/
async function send(msg) {
  return new Promise((resolve) => chrome.runtime.sendMessage(msg, resolve));
}

async function loadLevel() {
  const res = await send({ type: 'GET_LEVEL' });
  const level = res?.level ?? 'INFO';
  document.getElementById('level').textContent = `Niveau: ${level}`;
}

function renderLogs(logs) {
  const ul = document.getElementById('logs');
  ul.innerHTML = '';
  logs.forEach((l) => {
    const li = document.createElement('li');
    li.className = `level-${l.level.toLowerCase()}`;
    li.textContent = `[${l.ts}] ${l.level}: ${l.msg}`;
    ul.appendChild(li);
  });
}

async function refresh() {
  const res = await send({ type: 'GET_LOGS' });
  renderLogs(res?.logs ?? []);
}

async function clearLogs() {
  await send({ type: 'CLEAR_LOGS' });
  await refresh();
}

async function exportJson() {
  const res = await send({ type: 'GET_LOGS' });
  const data = JSON.stringify(res?.logs ?? [], null, 2);
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  // Télécharge un fichier logs.json
  const a = document.createElement('a');
  a.href = url;
  a.download = 'logs.json';
  a.click();
  URL.revokeObjectURL(url);
}

document.getElementById('refresh').addEventListener('click', refresh);
document.getElementById('clear').addEventListener('click', clearLogs);
document.getElementById('export').addEventListener('click', exportJson);

(async () => {
  await loadLevel();
  await refresh();
})();

