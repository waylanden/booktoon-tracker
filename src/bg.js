// bg.js — Service Worker MV3 (stockage, alias, logs, menu contextuel)
import { Storage } from './storage.js';
import { log, LOG_LEVELS, setLogLevel, getLogs, clearLogs } from './logger.js';

const KEY_SERIES = 'series_index';
const KEY_SETTINGS = 'settings';

const keyOf = t => (t || '').toLowerCase().replace(/\s+/g, ' ').trim();

chrome.runtime.onInstalled.addListener(async () => {
  const s = await Storage.get(KEY_SETTINGS);
  if (!s) {
    await Storage.set(KEY_SETTINGS, { allowedHosts: [], autoMark: true, aliases: {} });
    await setLogLevel(LOG_LEVELS.INFO);
  }
  chrome.contextMenus.create({
    id: 'mark-read',
    title: 'Marquer ce chapitre comme lu',
    contexts: ['page']
  });
  await log('INFO', 'Extension installée/mise à jour');
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === 'mark-read' && tab?.id) {
    chrome.tabs.sendMessage(tab.id, { type: 'CONTEXT_MARK_READ' });
    await log('INFO', 'Menu contextuel utilisé', { tabId: tab.id });
  }
});

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  (async () => {
    switch (msg?.type) {
      case 'REPORT_PROGRESS':
        await upsertProgress(msg.payload);
        sendResponse({ ok: true });
        break;
      case 'GET_ALL':
        sendResponse(await Storage.get(KEY_SERIES, {}));
        break;
      case 'GET_SETTINGS':
        sendResponse(await Storage.get(KEY_SETTINGS, { allowedHosts: [], autoMark: true, aliases: {} }));
        break;
      case 'SET_SETTINGS':
        await Storage.set(KEY_SETTINGS, msg.payload);
        await log('INFO', 'Options enregistrées', msg.payload);
        sendResponse({ ok: true });
        break;
      case 'GET_LOGS': {
        sendResponse(await getLogs());
        break;
      }
      case 'CLEAR_LOGS': {
        await clearLogs();
        sendResponse({ ok: true });
        break;
      }
      // Permettre aux content scripts d’envoyer des logs (debug)
      case 'LOG':
        await log(msg.level || 'INFO', msg.message || '', msg.data || null);
        sendResponse({ ok: true });
        break;
      default:
        await log('WARN', 'Message inconnu', msg);
    }
  })();
  return true;
});

async function upsertProgress({ title, chapter, url, site, meta }) {
  if (!title) return;

  const settings = await Storage.get(KEY_SETTINGS, { aliases: {} });
  const canonical = findCanonicalTitle(title, settings.aliases) || title;
  const k = keyOf(canonical);
  const series = await Storage.get(KEY_SERIES, {});

  const rec = series[k] || {
    canonicalName: canonical,
    titles: [],
    lastChapter: null,
    lastUrl: null,
    siteLast: null,
    updatedAt: null,
    rating: null,
    meta: { author: null, genres: [], releaseDates: [], cover: null },
    history: []
  };

  if (!rec.titles.includes(title)) rec.titles.push(title);

  if (meta && typeof meta === 'object') {
    rec.meta.author = meta.author ?? rec.meta.author;
    rec.meta.cover = meta.cover ?? rec.meta.cover;
    if (Array.isArray(meta.genres)) {
      rec.meta.genres = Array.from(new Set([...(rec.meta.genres || []), ...meta.genres]));
    }
    if (Array.isArray(meta.releaseDates)) {
      rec.meta.releaseDates = Array.from(new Set([...(rec.meta.releaseDates || []), ...meta.releaseDates]));
    }
  }

  if (chapter != null && (rec.lastChapter == null || chapter >= rec.lastChapter)) {
    rec.lastChapter = chapter;
    rec.lastUrl = url;
    rec.siteLast = site;
    rec.updatedAt = new Date().toISOString();
    rec.history.unshift({ chapter, url, site, date: rec.updatedAt });
    rec.history = rec.history.slice(0, 300);
  }

  series[k] = rec;
  await Storage.set(KEY_SERIES, series);
  await log('INFO', 'Progression mise à jour', { canonical: rec.canonicalName, chapter, site });
}

function findCanonicalTitle(title, aliasesMap) {
  const t = keyOf(title);
  for (const [canonical, aliasList] of Object.entries(aliasesMap || {})) {
    const list = (aliasList || []).map(a => keyOf(a)).concat([keyOf(canonical)]);
    if (list.includes(t)) return canonical;
  }
  return null;
}
