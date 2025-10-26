/*
  src/storage.js
  - API simple Storage.get/set basée sur chrome.storage.local
  - Storage.get(key, fallback?) -> value | fallback
*/
const local = chrome.storage?.local;

export class Storage {
  static get(key, fallback = undefined) {
    return new Promise((resolve, reject) => {
      try {
        local.get([key], (res) => {
          const err = chrome.runtime.lastError;
          if (err) return reject(err);
          const val = res?.[key];
          resolve(val === undefined ? fallback : val);
        });
      } catch (e) { reject(e); }
    });
  }

  static set(key, value) {
    return new Promise((resolve, reject) => {
      try {
        local.set({ [key]: value }, () => {
          const err = chrome.runtime.lastError;
          if (err) return reject(err);
          resolve();
        });
      } catch (e) { reject(e); }
    });
  }
}

