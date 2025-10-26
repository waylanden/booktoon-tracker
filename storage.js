/*
  storage.js
  - Mince couche Promise autour de chrome.storage.local
  - Fournit getLocal, setLocal, updateLocal, removeLocal avec gestion d'erreurs.
*/
const local = chrome.storage?.local;

export function getLocal(keys) {
  return new Promise((resolve, reject) => {
    try {
      local.get(keys, (result) => {
        const err = chrome.runtime.lastError;
        if (err) return reject(err);
        resolve(result);
      });
    } catch (e) {
      reject(e);
    }
  });
}

export function setLocal(obj) {
  return new Promise((resolve, reject) => {
    try {
      local.set(obj, () => {
        const err = chrome.runtime.lastError;
        if (err) return reject(err);
        resolve();
      });
    } catch (e) {
      reject(e);
    }
  });
}

export async function updateLocal(key, updater) {
  const cur = await getLocal([key]);
  const nextVal = await updater(cur?.[key]);
  await setLocal({ [key]: nextVal });
  return nextVal;
}

export function removeLocal(keys) {
  return new Promise((resolve, reject) => {
    try {
      local.remove(keys, () => {
        const err = chrome.runtime.lastError;
        if (err) return reject(err);
        resolve();
      });
    } catch (e) {
      reject(e);
    }
  });
}

