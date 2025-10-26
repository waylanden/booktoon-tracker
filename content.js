/*
  Content script pour Booktoon Tracker.
  - Exemple minimal: envoie un log au background quand la page est prête.
  - Peut contenir la logique d'extraction via adapters.js (non utilisé ici).
*/
(function () {
  const whenReady = () => {
    chrome.runtime.sendMessage({
      type: 'LOG',
      level: 'DEBUG',
      msg: 'Content script chargé',
      meta: { url: location.href }
    });
  };

  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    whenReady();
  } else {
    window.addEventListener('DOMContentLoaded', whenReady, { once: true });
  }
})();

