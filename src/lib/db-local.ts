const DB_NAME = "MinhaEstanteLocalDB";
const STORE_NAME = "livros_conteudo";

function getDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB não suportado neste ambiente"));
      return;
    }
    const timeout = setTimeout(() => reject(new Error("Timeout ao abrir IndexedDB")), 2000);
    try {
      const request = indexedDB.open(DB_NAME, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME);
        }
      };
      request.onsuccess = () => {
        clearTimeout(timeout);
        resolve(request.result);
      };
      request.onerror = () => {
        clearTimeout(timeout);
        reject(request.error);
      };
      request.onblocked = () => {
        clearTimeout(timeout);
        reject(new Error("IndexedDB bloqueado"));
      };
    } catch (e) {
      clearTimeout(timeout);
      reject(e);
    }
  });
}

export async function salvarConteudoLocal(livroId: number, texto: string): Promise<void> {
  try {
    const db = await getDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      const request = store.put(texto, livroId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.warn("Não foi possível salvar no IndexedDB local:", e);
  }
}

export async function obterConteudoLocal(livroId: number): Promise<string | null> {
  try {
    const timeoutPromise = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1000));
    const dbPromise = (async () => {
      const db = await getDB();
      return new Promise<string | null>((resolve) => {
        try {
          const transaction = db.transaction(STORE_NAME, "readonly");
          const store = transaction.objectStore(STORE_NAME);
          const request = store.get(livroId);
          request.onsuccess = () => resolve(request.result || null);
          request.onerror = () => resolve(null);
        } catch {
          resolve(null);
        }
      });
    })();
    return await Promise.race([dbPromise, timeoutPromise]);
  } catch {
    return null;
  }
}

