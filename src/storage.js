// Everything the person writes lives on this device only. Two copies, so one failing does not lose it:
// IndexedDB (roomy, the main copy) and localStorage (a quick mirror). The newest one wins on open.
const DB = "belief-lab", STORE = "kv", KEY = "items";

function idb() {
  return new Promise((res, rej) => {
    if (!window.indexedDB) return rej(new Error("no indexedDB"));
    const r = indexedDB.open(DB, 1);
    r.onupgradeneeded = () => r.result.createObjectStore(STORE);
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
const idbGet = async () => { const db = await idb(); return new Promise((res, rej) => { const q = db.transaction(STORE).objectStore(STORE).get(KEY); q.onsuccess = () => res(q.result || null); q.onerror = () => rej(q.error); }); };
const idbPut = async (v) => { const db = await idb(); return new Promise((res, rej) => { const t = db.transaction(STORE, "readwrite"); t.objectStore(STORE).put(v, KEY); t.oncomplete = () => res(); t.onerror = () => rej(t.error); t.onabort = () => rej(t.error); }); };

const lsRead = () => { try { const items = JSON.parse(localStorage.getItem("bl-items") || "null"); const at = +localStorage.getItem("bl-items-at") || 0; return items ? { items, at } : null; } catch { return null; } };

/** Pick the copy that was saved last; on a tie, the one with more items. */
export function newest(a, b) {
  if (!a) return b; if (!b) return a;
  if (a.at !== b.at) return a.at > b.at ? a : b;
  return (a.items.length >= b.items.length) ? a : b;
}

export async function loadItems() {
  let fromDb = null; try { fromDb = await idbGet(); } catch {}
  const fromLs = lsRead(), best = newest(fromDb, fromLs);
  if (best && best !== fromDb) { try { await idbPut(best); } catch {} } // heal the main copy
  if (best && best !== fromLs) { try { localStorage.setItem("bl-items", JSON.stringify(best.items)); localStorage.setItem("bl-items-at", String(best.at)); } catch {} } // and the mirror
  return best ? best.items : [];
}

let chain = Promise.resolve();
/** Save both copies. Resolves true if at least one copy is safe; fires "bl-save-failed" if none is. */
export function saveItems(items) {
  const rec = { items, at: Date.now() };
  let lsOk = true; try { localStorage.setItem("bl-items", JSON.stringify(items)); localStorage.setItem("bl-items-at", String(rec.at)); } catch { lsOk = false; }
  chain = chain.then(() => idbPut(rec).then(() => true, () => false)).then((dbOk) => { const ok = dbOk || lsOk; if (!ok) window.dispatchEvent(new Event("bl-save-failed")); return ok; });
  return chain;
}

/** Remove everything this app keeps about the person. The speech model and the app files stay. */
export async function wipeAll() {
  try { const db = await idb(); await new Promise((res) => { const t = db.transaction(STORE, "readwrite"); t.objectStore(STORE).clear(); t.oncomplete = res; t.onerror = res; }); } catch {}
  try { Object.keys(localStorage).filter((k) => k.startsWith("bl-")).forEach((k) => localStorage.removeItem(k)); } catch {}
}

export async function storageStatus() {
  let persisted = null, usage = null;
  try { persisted = await navigator.storage?.persisted?.(); } catch {}
  try { const e = await navigator.storage?.estimate?.(); usage = e && e.usage; } catch {}
  return { persisted, usage };
}
