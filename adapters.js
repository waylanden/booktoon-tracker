/*
  adapters.js
  - Point d'extension pour implémenter des extracteurs spécifiques (sites webtoon/ebook).
  - Exemple d'API suggérée: registerAdapter(domain, { match(url), extract(document) }).
  - Cette ébauche fournit un registre simple et une méthode run(url, document).
*/
const registry = new Map();

export function registerAdapter(domain, adapter) {
  registry.set(domain, adapter);
}

export function getAdapterForUrl(url) {
  try {
    const u = new URL(url);
    const host = u.hostname;
    for (const [domain, adapter] of registry) {
      if (host === domain || host.endsWith(`.${domain}`)) return adapter;
    }
  } catch {}
  return null;
}

export async function runAdapter(url, doc) {
  const adapter = getAdapterForUrl(url);
  if (!adapter || typeof adapter.extract !== 'function') return null;
  return adapter.extract(doc);
}

