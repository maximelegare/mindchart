import { mmkv } from "@/context/bridge/zustand_mmkv";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserSecuritySettingsPreferences = {
  biometricRecoveryEnabled: boolean;
  setBiometricRecoveryEnabled: (biometricRecoveryEnabled: boolean) => void;
};

export const useSecuritySettingsPreferences =
  create<UserSecuritySettingsPreferences>()(
    persist(
      (set) => ({
        biometricRecoveryEnabled: false,
        setBiometricRecoveryEnabled: (biometricRecoveryEnabled: boolean) =>
          set({ biometricRecoveryEnabled }),
      }),
      {
        ...mmkv("security"),
        partialize: (state) => ({
          biometricRecoveryEnabled: state.biometricRecoveryEnabled,
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
