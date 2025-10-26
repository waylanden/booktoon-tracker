/*
  src/logger.js
  - Couche de compatibilité fonctionnelle au-dessus du logger racine.
  - Expose: LOG_LEVELS, log(level,msg,meta), setLogLevel(name), getLogs(), clearLogs().
*/
import { logger } from '../logger.js';

export const LOG_LEVELS = { DEBUG: 'DEBUG', INFO: 'INFO', WARN: 'WARN', ERROR: 'ERROR' };

export async function log(level, message, meta) {
  const name = String(level || 'INFO').toUpperCase();
  return logger.log(name, message, meta);
}

export async function setLogLevel(level) {
  await logger.setLevel(level);
}

export async function getLogLevel() {
  return logger.getLevel();
}

export async function getLogs() {
  return logger.getLogs();
}

export async function clearLogs() {
  return logger.clear();
}
