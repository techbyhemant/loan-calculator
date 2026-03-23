export async function register() {
  // Polyfill localStorage for server-side
  // Node.js 22+ exposes a broken localStorage global that causes
  // chart.js and other browser libraries to crash during SSR
  if (typeof window === "undefined") {
    const storage = new Map<string, string>();
    (globalThis as Record<string, unknown>).localStorage = {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
      removeItem: (key: string) => storage.delete(key),
      clear: () => storage.clear(),
      get length() {
        return storage.size;
      },
      key: (index: number) => [...storage.keys()][index] ?? null,
    };
  }
}
