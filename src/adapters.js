/*
  src/adapters.js
  - Content scripts ne supportent pas ES modules: on expose un global window.Adapters.
  - Chaque adaptateur fournit { test():bool, extract():{title,chapter,site} }.
*/
(function(){
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

  // Expose en global pour les autres scripts de contenu
  window.Adapters = [GenericAdapter];
})();
