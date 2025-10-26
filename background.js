/*
  Background (service worker) MV3 pour Booktoon Tracker.
  - Initialise l'extension et centralise la journalisation via logger.
  - Reçoit des messages LOG/GET_LOGS/CLEAR_LOGS des autres contextes.
*/
import { logger } from './logger.js';
import { getLocal, setLocal } from './storage.js';

// Log d'initialisation à l'installation/mise à jour
chrome.runtime.onInstalled.addListener(async (details) => {
  await logger.info('Extension installée/mise à jour', { reason: details.reason });
});

// Gestion des messages en provenance de popup/options/content
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  (async () => {
    switch (message?.type) {
      case 'LOG': {
        const { level = 'INFO', msg = '', meta = {} } = message;
        await logger.log(level, msg, meta);
        sendResponse({ ok: true });
        break;
      }
      case 'GET_LOGS': {
        const logs = await logger.getLogs();
        sendResponse({ ok: true, logs });
        break;
      }
      case 'CLEAR_LOGS': {
        await logger.clear();
        sendResponse({ ok: true });
        break;
      }
      case 'GET_LEVEL': {
        const level = await logger.getLevel();
        sendResponse({ ok: true, level });
        break;
      }
      case 'SET_LEVEL': {
        await logger.setLevel(message.level);
        sendResponse({ ok: true });
        break;
      }
      default:
        sendResponse({ ok: false, error: 'Type de message inconnu' });
    }
  })();
  return true; // réponse asynchrone
});

