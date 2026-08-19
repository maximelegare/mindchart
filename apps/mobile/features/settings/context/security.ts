import { mmkv } from "@/context/bridge/zustand_mmkv";
import type { LockScreenMode } from "@/features/lockScreen/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserSecuritySettingsPreferences = {
  recoveryPassphraseEnabled: boolean;
  setRecoveryPassphraseEnabled: (recoveryPassphraseEnabled: boolean) => void;
  lockScreenMode: LockScreenMode;
  setLockScreenMode: (lockScreenMode: LockScreenMode) => void;
  customPinBiometricEnabled: boolean;
  setCustomPinBiometricEnabled: (customPinBiometricEnabled: boolean) => void;
};

export const useSecuritySettingsPreferences =
  create<UserSecuritySettingsPreferences>()(
    persist(
      (set) => ({
        recoveryPassphraseEnabled: false,
        setRecoveryPassphraseEnabled: (recoveryPassphraseEnabled: boolean) =>
          set({ recoveryPassphraseEnabled }),
        lockScreenMode: "off",
        setLockScreenMode: (lockScreenMode: LockScreenMode) =>
          set({ lockScreenMode }),
        customPinBiometricEnabled: true,
        setCustomPinBiometricEnabled: (customPinBiometricEnabled: boolean) =>
          set({ customPinBiometricEnabled }),
      }),
      {
        ...mmkv("security"),
        partialize: (state) => ({
          recoveryPassphraseEnabled: state.recoveryPassphraseEnabled,
          lockScreenMode: state.lockScreenMode,
          customPinBiometricEnabled: state.customPinBiometricEnabled,
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
