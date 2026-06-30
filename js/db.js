const _DB_NAME  = 'MemoMemo_DB';
const _DB_VER   = 1;
const _DB_STORE = 'sessions';

function _openDB() {
    return new Promise((resolve, reject) => {
        const req = indexedDB.open(_DB_NAME, _DB_VER);
        req.onupgradeneeded = e => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains(_DB_STORE))
                db.createObjectStore(_DB_STORE);
        };
        req.onsuccess = e => resolve(e.target.result);
        req.onerror  = e => reject(e.target.error);
    });
}

export async function idbSet(key, value) {
    try {
        const db = await _openDB();
        await new Promise((res, rej) => {
            const tx = db.transaction(_DB_STORE, 'readwrite');
            tx.objectStore(_DB_STORE).put(value, key);
            tx.oncomplete = res;
            tx.onerror = e => rej(e.target.error);
        });
    } catch(e) { console.warn('[IDB] write:', e); }
}

export async function idbGet(key) {
    try {
        const db = await _openDB();
        return await new Promise((res, rej) => {
            const tx  = db.transaction(_DB_STORE, 'readonly');
            const req = tx.objectStore(_DB_STORE).get(key);
            req.onsuccess = e => res(e.target.result ?? null);
            req.onerror   = e => rej(e.target.error);
        });
    } catch(e) { console.warn('[IDB] read:', e); return null; }
}

export async function idbDelete(key) {
    try {
        const db = await _openDB();
        await new Promise((res, rej) => {
            const tx = db.transaction(_DB_STORE, 'readwrite');
            tx.objectStore(_DB_STORE).delete(key);
            tx.oncomplete = res;
            tx.onerror = e => rej(e.target.error);
        });
    } catch(e) { console.warn('[IDB] delete:', e); }
}

export function lsSet(key, value) {
    try { localStorage.setItem('mm_' + key, JSON.stringify(value)); } catch(e) {}
}

export function lsGet(key, fallback = null) {
    try {
        const v = localStorage.getItem('mm_' + key);
        return v !== null ? JSON.parse(v) : fallback;
    } catch(e) { return fallback; }
}

export function lsDel(key) {
    try { localStorage.removeItem('mm_' + key); } catch(e) {}
}
