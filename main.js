// ===================== INDEXEDDB =====================
const dbPromise = indexedDB.open('finanzas-db', 1);

dbPromise.onupgradeneeded = event => {
  const db = event.target.result;
  if (!db.objectStoreNames.contains('tarjetas')) {
    db.createObjectStore('tarjetas', { keyPath: 'id', autoIncrement: true });
  }
};

function guardarTarjeta(tarjeta) {
  return dbPromise.then(db => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction('tarjetas', 'readwrite');
      const store = tx.objectStore('tarjetas');
      store.add(tarjeta);
      tx.oncomplete = () => resolve();
      tx.onerror = e => reject(e);
    });
  });
}

function obtenerTarjetas() {
  return dbPromise.then(db => {
    return new Promise((resolve, reject) => {
      const tx = db.transaction('tarjetas', 'readonly');
      const store = tx.objectStore('tarjetas');
      const getAll = store.getAll();
      getAll.onsuccess = () => resolve(getAll.result);
      getAll.onerror = e => reject(e);
    });
  });
}
