const DB_NAME = "MinhaEstanteLocalDB";
const STORE_NAME = "livros_conteudo";

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB não suportado neste ambiente"));
      return;
    }
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function salvarConteudoLocal(livroId: number, texto: string): Promise<void> {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(texto, livroId);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function obterConteudoLocal(livroId: number): Promise<string | null> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(livroId);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return null;
  }
}
