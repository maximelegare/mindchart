import { getItem, setItem } from "@/lib/storage";

const BIOMETRIC_RECOVERY_ENABLED = "workspace_biometric_recovery_enabled";

export function isBiometricRecoveryEnabled(): boolean {
  return getItem(BIOMETRIC_RECOVERY_ENABLED) === "1";
}

export function setBiometricRecoveryEnabled(enabled: boolean): void {
  setItem(BIOMETRIC_RECOVERY_ENABLED, enabled ? "1" : "0");
}
