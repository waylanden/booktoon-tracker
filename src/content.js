// content.js — Détection automatique (70% scroll ou 20s) + "Marquer comme lu"
// Note: pas d'import ES module en content script; `Adapters` est exposé par src/adapters.js

// Envoie des logs vers le background (affichés dans Options > Journal)
function debugLog(level, message, data) {
  try { chrome.runtime.sendMessage({ type: 'LOG', level, message, data }); } catch {}
}

function extractInfo() {
  const adapter = Adapters.find(a => a.test());
  const { title, chapter, site } = adapter.extract();

  const author = document.querySelector('meta[name="author"]')?.content || null;
  const cover = document.querySelector('meta[property="og:image"]')?.content || null;
  const keywords = document.querySelector('meta[name="keywords"]')?.content || '';
  const genres = keywords ? keywords.split(',').map(s => s.trim()).filter(Boolean) : [];

  const info = { title, chapter, site: site || location.hostname, meta: { author, cover, genres } };
  debugLog('DEBUG', 'Extract info', { frame: window.top === window ? 'top' : 'iframe', info });
  return info;
}

async function report(payload) {
  try { await chrome.runtime.sendMessage({ type: 'REPORT_PROGRESS', payload }); }
  catch (e) { debugLog('ERROR', 'REPORT_PROGRESS failed', String(e)); }
}

let sent = false;
function markOnce(info) {
  if (sent) return;
  sent = true;
  debugLog('INFO', 'Mark read (auto/force)', { info });
  report({ ...info, url: location.href });
}

function setup(info) {
  const timer = setTimeout(() => markOnce(info), 20000);

  let max = 0;
  const onScroll = () => {
    const doc = document.scrollingElement || document.documentElement;
    const s = (window.scrollY + window.innerHeight) / (doc.scrollHeight || 1);
    if (s > max) max = s;
    if (max >= 0.7) {
      window.removeEventListener('scroll', onScroll, { passive: true });
      markOnce(info);
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') clearTimeout(timer);
  });
}

(async function main() {
  const info = extractInfo();
  if (!info.title) {
    debugLog('WARN', 'Titre non détecté');
    return;
  }

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg?.type === 'CONTEXT_MARK_READ') markOnce(info);
  });

  try {
    const settings = await chrome.runtime.sendMessage({ type: 'GET_SETTINGS' });
    const allowed = settings?.allowedHosts || [];
    const ok = allowed.length === 0 || allowed.some(d => location.hostname.endsWith(d));
    debugLog('DEBUG', 'Settings check', { allowed, ok, host: location.hostname });
    if (ok && settings?.autoMark !== false) setup(info);
  } catch (e) {
    debugLog('WARN', 'GET_SETTINGS failed, fallback to setup', String(e));
    setup(info);
  }
})();
