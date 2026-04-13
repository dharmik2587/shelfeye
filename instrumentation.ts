/**
 * Some host runtimes expose a partial `localStorage` object in Node.js.
 * next-themes and Next dev overlay expect the full Storage API.
 */
export async function register() {
  const g = globalThis as typeof globalThis & {
    localStorage?: Storage | Record<string, unknown>;
    sessionStorage?: Storage | Record<string, unknown>;
  };

  const patchStorage = (key: "localStorage" | "sessionStorage") => {
    const existing = g[key];
    if (!existing || typeof (existing as Storage).getItem === "function") {
      return;
    }

    const memory = new Map<string, string>();
    const storageShim: Storage = {
      get length() {
        return memory.size;
      },
      clear() {
        memory.clear();
      },
      getItem(itemKey) {
        return memory.has(itemKey) ? memory.get(itemKey)! : null;
      },
      key(index) {
        return Array.from(memory.keys())[index] ?? null;
      },
      removeItem(itemKey) {
        memory.delete(itemKey);
      },
      setItem(itemKey, value) {
        memory.set(itemKey, String(value));
      },
    };

    g[key] = storageShim;
  };

  patchStorage("localStorage");
  patchStorage("sessionStorage");
}
