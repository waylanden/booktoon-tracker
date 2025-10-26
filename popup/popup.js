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

function renderSeriesList(seriesArr) {
  const ul = document.getElementById('series');
  ul.innerHTML = '';
  if (!Array.isArray(seriesArr) || seriesArr.length === 0) {
    const li = document.createElement('li');
    li.textContent = 'Aucune série suivie pour le moment';
    ul.appendChild(li);
    return;
  }
  seriesArr
    .sort((a,b)=> (a.canonicalName||'').localeCompare(b.canonicalName||''))
    .forEach((rec) => {
      const name = rec.canonicalName || '(sans titre)';
      const ch = rec.lastChapter != null ? `chapitre ${rec.lastChapter}` : 'chapitre ?';
      const site = rec.siteLast || (new URL(rec.lastUrl||location.href)).hostname;
      const li = document.createElement('li');
      li.textContent = `${name} : ${ch} • site: ${site}`;
      ul.appendChild(li);
    });
}

async function loadSeries() {
  try {
    const seriesObj = await send({ type: 'GET_ALL' });
    const arr = Object.values(seriesObj || {});
    renderSeriesList(arr);
  } catch (e) {
    console.warn('GET_ALL failed', e);
    renderSeriesList([]);
  }
}

async function refreshLogs() {
  const res = await send({ type: 'GET_LOGS' });
  renderLogs(res?.logs ?? []);
}

async function clearLogs() {
  await send({ type: 'CLEAR_LOGS' });
  await refreshLogs();
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

document.getElementById('refresh').addEventListener('click', async () => {
  await loadSeries();
  await refreshLogs();
});
document.getElementById('clear').addEventListener('click', clearLogs);
document.getElementById('export').addEventListener('click', exportJson);

(async () => {
  await loadLevel();
  await loadSeries();
  await refreshLogs();
})();
