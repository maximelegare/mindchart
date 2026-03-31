import { StateStorage } from "zustand/middleware";
import { MMKV } from "react-native-mmkv";

import { createJSONStorage } from "zustand/middleware";

const storage = new MMKV();

export const mmkvStorage: StateStorage = {
  setItem: (name, value) => {
    return storage.set(name, value);
  },
  getItem: (name) => {
    const value = storage.getString(name);
    return value ?? null;
  },
  removeItem: (name) => {
    return storage.delete(name);
  },
};

export const mmkv = (key: string) => ({
  name: key,
  storage: createJSONStorage(() => mmkvStorage),
});
