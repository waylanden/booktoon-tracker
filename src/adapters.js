/*
  src/adapters.js
  - Tableau Adapters d'extracteurs { test():bool, extract():{title,chapter,site} }
  - Fournit un adaptateur générique par défaut.
*/

function parseTitleAndChapter() {
  const t = (document.querySelector('h1')?.textContent || document.title || '').trim();
  let chapter = null;
  const m = t.match(/(chapitre|chapter|ep|episode|ép|épisode)\s*(\d+[\.]?\d*)/i);
  if (m) chapter = parseFloat(m[2]);
  return { title: t.replace(/\s*[–\-|•].*$/,'').trim(), chapter };
}

const GenericAdapter = {
  test() { return true; },
  extract() {
    const { title, chapter } = parseTitleAndChapter();
    return { title, chapter, site: location.hostname };
  }
};

export const Adapters = [GenericAdapter];

