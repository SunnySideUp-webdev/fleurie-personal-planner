export const STORAGE_ERROR_EVENT = "fleurie-storage-error";

let lastErrorAt = 0;

export function setLocalStorageItem(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch (error) {
    const now = Date.now();
    if (now - lastErrorAt > 750) {
      lastErrorAt = now;
      window.dispatchEvent(
        new CustomEvent(STORAGE_ERROR_EVENT, {
          detail: {
            key,
            name: error instanceof Error ? error.name : "StorageError",
          },
        }),
      );
    }
    return false;
  }
}
