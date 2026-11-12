/**
 * Typed Chrome Storage Local Helper
 * Automatically falls back to localStorage when testing outside Chrome extension runtime.
 */

export interface StorageSchema {
  theme: "dark" | "light" | "system";
  apiKey?: string;
  notes: Array<{ id: string; title: string; content: string; createdAt: string }>;
  quickPrompts: string[];
  autoAnalyze: boolean;
}

const DEFAULT_STORAGE: StorageSchema = {
  theme: "dark",
  notes: [
    {
      id: "1",
      title: "Bienvenido a ChromeLaunch",
      content: "Tu starter kit está listo para producción. Configura tu extensión y comienza a monetizar.",
      createdAt: new Date().toLocaleDateString(),
    },
  ],
  quickPrompts: [
    "Resume los puntos clave de esta página",
    "Extrae todas las tablas de datos en formato Markdown",
    "Genera una respuesta profesional a este contenido",
  ],
  autoAnalyze: true,
};

export const storage = {
  async get<K extends keyof StorageSchema>(key: K): Promise<StorageSchema[K]> {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      return new Promise((resolve) => {
        chrome.storage.local.get([key], (result) => {
          if (result[key] !== undefined && result[key] !== null) {
            resolve(result[key] as StorageSchema[K]);
          } else {
            resolve(DEFAULT_STORAGE[key]);
          }
        });
      });
    }

    const localItem = localStorage.getItem(`ext_${String(key)}`);
    if (localItem !== null) {
      try {
        return JSON.parse(localItem);
      } catch {
        return localItem as unknown as StorageSchema[K];
      }
    }
    return DEFAULT_STORAGE[key];
  },

  async set<K extends keyof StorageSchema>(key: K, value: StorageSchema[K]): Promise<void> {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      return new Promise((resolve) => {
        chrome.storage.local.set({ [key]: value }, () => resolve());
      });
    }

    localStorage.setItem(`ext_${String(key)}`, JSON.stringify(value));
  },

  async getAll(): Promise<StorageSchema> {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      return new Promise((resolve) => {
        chrome.storage.local.get(null, (result) => {
          resolve({ ...DEFAULT_STORAGE, ...result });
        });
      });
    }

    const output = { ...DEFAULT_STORAGE };
    for (const key of Object.keys(DEFAULT_STORAGE) as Array<keyof StorageSchema>) {
      const item = localStorage.getItem(`ext_${String(key)}`);
      if (item !== null) {
        try {
          (output as any)[key] = JSON.parse(item);
        } catch {
          (output as any)[key] = item;
        }
      }
    }
    return output;
  },

  async clear(): Promise<void> {
    if (typeof chrome !== "undefined" && chrome.storage && chrome.storage.local) {
      return new Promise((resolve) => chrome.storage.local.clear(resolve));
    }
    localStorage.clear();
  },
};
