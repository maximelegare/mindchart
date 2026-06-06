import { mmkv } from "@/context/bridge/zustand_mmkv";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserSecuritySettingsPreferences = {
  recoveryPassphraseEnabled: boolean;
  setRecoveryPassphraseEnabled: (recoveryPassphraseEnabled: boolean) => void;
};

export const useSecuritySettingsPreferences =
  create<UserSecuritySettingsPreferences>()(
    persist(
      (set) => ({
        recoveryPassphraseEnabled: false,
        setRecoveryPassphraseEnabled: (recoveryPassphraseEnabled: boolean) =>
          set({ recoveryPassphraseEnabled }),
      }),
      {
        ...mmkv("security"),
        partialize: (state) => ({
          recoveryPassphraseEnabled: state.recoveryPassphraseEnabled,
        }),
        merge: (persistedState, currentState) => {
          const persisted = (persistedState ??
            {}) as Partial<UserSecuritySettingsPreferences>;
          return {
            ...currentState,
            ...persisted,
          };
        },
      }
    )
  );
