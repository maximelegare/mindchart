import { create } from "zustand";

export type UserSecuritySettingsPreferences = {
  biometricRecoveryEnabled: boolean;
  setBiometricRecoveryEnabled: (biometricRecoveryEnabled: boolean) => void;
};

export const useSecuritySettingsPreferences =
  create<UserSecuritySettingsPreferences>((set) => ({
    biometricRecoveryEnabled: false,
    setBiometricRecoveryEnabled: (biometricRecoveryEnabled: boolean) =>
      set({ biometricRecoveryEnabled }),
  }));
