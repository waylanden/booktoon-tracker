/*
  utils.js
  - Aides utilitaires diverses: délai, ID, horodatage.
*/
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export function nowIso() {
  return new Date().toISOString();
}

export function safeJsonParse(text, fallback = null) {
  try { return JSON.parse(text); } catch { return fallback; }
}

export function uid(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`;
}

