/*
  Options: sélection du niveau de log et actions de test.
*/
async function send(msg) {
  return new Promise((resolve) => chrome.runtime.sendMessage(msg, resolve));
}

async function syncLevelToUI() {
  const res = await send({ type: 'GET_LEVEL' });
  const level = res?.level ?? 'INFO';
  document.getElementById('level').value = level;
}

async function saveLevel() {
  const level = document.getElementById('level').value;
  await send({ type: 'SET_LEVEL', level });
  await syncLevelToUI();
}

document.getElementById('save').addEventListener('click', saveLevel);
document.getElementById('test-debug').addEventListener('click', () => {
  send({ type: 'LOG', level: 'DEBUG', msg: 'Test DEBUG depuis options' });
});
document.getElementById('test-error').addEventListener('click', () => {
  send({ type: 'LOG', level: 'ERROR', msg: 'Test ERROR depuis options', meta: { foo: 'bar' } });
});

syncLevelToUI();

