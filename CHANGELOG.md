# Changelog

Toutes les modifications notables de ce projet sont documentées dans ce fichier.

## v0.1.0 — 2025-10-26

### Ajouté
- Initialisation de l’extension Chrome Manifest V3 (MV3).
- Module `logger.js` multi‑niveaux (DEBUG/INFO/WARN/ERROR) avec persistance `chrome.storage.local` et rotation (500 entrées).
- Service worker `background.js` centralisant la journalisation et exposant des messages: `LOG`, `GET_LOGS`, `CLEAR_LOGS`, `GET_LEVEL`, `SET_LEVEL`.
- `content.js` (log de chargement) et ébauche `adapters.js`.
- Couche stockage `storage.js` (Promises) et utilitaires `utils.js`.
- Interface `popup/` pour visualiser/effacer/exporter les logs.
- Page d’options `options/` pour régler le niveau de log et tester des entrées.
- Workflows GitHub Actions: CI (validation manifest) et Release (zip + publication sur tag `v*.*.*`).
- Icônes de base `icon16/32/48/128.png`.

