// logger.js
// Module de journalisation multi-niveaux pour MV3, avec persistance chrome.storage.local.
// Niveaux: DEBUG, INFO, WARN, ERROR. Inclut rotation simple et export.

// Définition des niveaux sous forme de constantes numériques.
const LEVELS = { DEBUG: 10, INFO: 20, WARN: 30, ERROR: 40 };
// Clé de stockage principale pour les logs en local.
const STORAGE_KEY = 'bt_logs';
// Clé de stockage pour le niveau de log courant.
const LEVEL_KEY = 'bt_log_level';
// Nombre maximum d'entrées à conserver (simple rotation en FIFO).
const MAX_LOGS = 500;

// Import des utilitaires de stockage (Promise-based) depuis storage.js.
import { getLocal, setLocal, updateLocal } from './storage.js';

// Classe Logger gérant la création et la persistance des entrées de log.
export class Logger {
  // Constructeur: initialise le niveau par défaut et le miroir console.
  constructor() {
    // Niveau par défaut INFO pour éviter le bruit en production.
    this.levelName = 'INFO';
    // Active la réplication vers la console du navigateur.
    this.mirrorConsole = true;
    // Mémo du chargement initial du niveau depuis le stockage.
    this._levelLoaded = false;
  }

  // Convertit un nom de niveau (string) en valeur numérique.
  toLevelValue(name) {
    const key = String(name || '').toUpperCase();
    return LEVELS[key] ?? LEVELS.INFO;
  }

  // Retourne le nom de niveau courant (string).
  async getLevel() {
    // Charge depuis chrome.storage.local la première fois.
    if (!this._levelLoaded) {
      const obj = await getLocal([LEVEL_KEY]);
      const stored = obj?.[LEVEL_KEY];
      if (stored && LEVELS[stored]) {
        this.levelName = stored;
      }
      this._levelLoaded = true;
    }
    return this.levelName;
  }

  // Définit le niveau et le persiste.
  async setLevel(name) {
    const upper = String(name || '').toUpperCase();
    this.levelName = LEVELS[upper] ? upper : 'INFO';
    await setLocal({ [LEVEL_KEY]: this.levelName });
  }

  // Ajoute une entrée de log si son niveau dépasse le seuil courant.
  async log(levelName, message, meta = undefined) {
    // Assure que le niveau courant est chargé.
    const curLevelName = await this.getLevel();
    // Convertit niveaux en valeurs numériques pour comparaison.
    const want = this.toLevelValue(levelName);
    const min = this.toLevelValue(curLevelName);
    // Ignore si en dessous du seuil.
    if (want < min) return false;

    // Construit l'entrée normalisée avec horodatage ISO et contexte optionnel.
    const entry = {
      ts: new Date().toISOString(),
      level: (String(levelName || '').toUpperCase()),
      msg: String(message ?? ''),
      meta: meta ?? null,
    };

    // Miroir vers la console pour faciliter le dev.
    if (this.mirrorConsole) {
      this._mirrorToConsole(entry);
    }

    // Persiste l'entrée dans chrome.storage.local avec rotation.
    await updateLocal(STORAGE_KEY, (cur) => {
      const arr = Array.isArray(cur) ? cur : [];
      arr.push(entry);
      if (arr.length > MAX_LOGS) {
        // Retire les plus anciens au-delà du quota.
        arr.splice(0, arr.length - MAX_LOGS);
      }
      return arr;
    });
    return true;
  }

  // Raccourcis par niveau.
  debug(msg, meta) { return this.log('DEBUG', msg, meta); }
  info(msg, meta) { return this.log('INFO', msg, meta); }
  warn(msg, meta) { return this.log('WARN', msg, meta); }
  error(msg, meta) { return this.log('ERROR', msg, meta); }

  // Récupère toutes les entrées actuellement stockées.
  async getLogs() {
    const obj = await getLocal([STORAGE_KEY]);
    const arr = obj?.[STORAGE_KEY];
    return Array.isArray(arr) ? arr : [];
  }

  // Vide le journal.
  async clear() {
    await setLocal({ [STORAGE_KEY]: [] });
  }

  // Exporte les logs en JSON stringifié.
  async exportJson(space = 2) {
    const logs = await this.getLogs();
    return JSON.stringify(logs, null, space);
  }

  // Active/désactive le miroir console.
  setMirrorConsole(enabled) {
    this.mirrorConsole = !!enabled;
  }

  // Délègue vers la console selon le niveau.
  _mirrorToConsole(entry) {
    const { level, msg, meta, ts } = entry;
    const line = `[${ts}] ${level}: ${msg}`;
    switch (level) {
      case 'DEBUG':
        console.debug(line, meta ?? '');
        break;
      case 'INFO':
        console.info(line, meta ?? '');
        break;
      case 'WARN':
        console.warn(line, meta ?? '');
        break;
      case 'ERROR':
      default:
        console.error(line, meta ?? '');
        break;
    }
  }
}

// Singleton prêt à l'emploi pour simplifier l'import.
export const logger = new Logger();

