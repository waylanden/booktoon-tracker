# Booktoon Tracker (Chrome MV3)

Extension Chrome Manifest V3 pour suivre des webtoons/ebooks avec un module de journalisation persistant (chrome.storage.local).

## Structure

- `manifest.json` — Déclaration MV3 (background, popup, options, permissions)
- `background.js` — Service worker, centre de messages et logs
- `content.js` — Script injecté; envoie un log de présence
- `adapters.js` — Registre pour extracteurs spécifiques (ébauche)
- `storage.js` — Enveloppe Promise pour chrome.storage.local
- `utils.js` — Utilitaires divers
- `logger.js` — Logger multi-niveaux (DEBUG/INFO/WARN/ERROR) avec persistance
- `popup/` — Interface de consultation des logs
- `options/` — Page d’options (choix du niveau de log)
- `.github/workflows/` — CI et Release GitHub Actions

## Installation locale

1. Ouvrir `chrome://extensions` dans Chrome
2. Activer le Mode développeur
3. Cliquer « Charger l’extension non empaquetée »
4. Sélectionner le dossier racine du projet

## Journalisation

- Les logs sont stockés sous la clé `bt_logs` (max 500 entrées). 
- Le niveau actif est stocké sous `bt_log_level`.
- Le background centralise la journalisation via `chrome.runtime.sendMessage({ type: 'LOG', level, msg, meta })`.

## Workflows

- `ci.yml` valide minimalement le `manifest.json`.
- `release.yml` crée une archive et une release lors d’un tag `v*.*.*`.

## Licence

MIT — voir `LICENSE`.

