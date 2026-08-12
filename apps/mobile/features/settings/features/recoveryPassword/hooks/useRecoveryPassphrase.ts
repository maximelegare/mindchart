import { useCallback, useEffect, useState } from "react";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { useSecuritySettingsPreferences } from "@/features/settings/context/security";
import { WorkspaceRecoveryError } from "@/features/workspaces/services/workspaceKeyErrors";
import {
  clearRecoveryPassphrase,
  setupRecoveryCredentials,
} from "../services/recoveryPassphraseService";
import * as recoveryPassphraseStore from "../services/recoveryPassphraseStore";

async function checkBiometricAvailability(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  return (
    hasHardware && isEnrolled && SecureStore.canUseBiometricAuthentication()
  );
}

async function authenticateOnce(promptMessage: string): Promise<void> {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    cancelLabel: "Cancel",
    disableDeviceFallback: false,
  });
  if (!result.success) {
    const reason =
      "error" in result && result.error ? String(result.error) : "cancelled";
    if (reason === "user_cancel" || reason === "system_cancel") {
      throw new WorkspaceRecoveryError("Authentication cancelled.");
    }
    throw new WorkspaceRecoveryError(
      `Authentication failed (${reason}). Try again.`
    );
  }
}

export function useRecoveryPassphrase() {
  const recoveryPassphraseEnabled = useSecuritySettingsPreferences(
    (s) => s.recoveryPassphraseEnabled
  );
  const setRecoveryPassphraseEnabled = useSecuritySettingsPreferences(
    (s) => s.setRecoveryPassphraseEnabled
  );

  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    checkBiometricAvailability().then(setBiometricAvailable);
  }, []);

  const enableRecoveryPassphrase = useCallback(
    async (passphrase: string) => {
      const trimmed = passphrase.trim();
      if (!trimmed) {
        throw new WorkspaceRecoveryError("Recovery passphrase is required.");
      }

      await setupRecoveryCredentials(trimmed);
      setRecoveryPassphraseEnabled(true);
    },
    [setRecoveryPassphraseEnabled]
  );

  const disableRecoveryPassphrase = useCallback(async () => {
    setRecoveryPassphraseEnabled(false);
    await clearRecoveryPassphrase();
  }, [setRecoveryPassphraseEnabled]);

  const revealRecoveryPassphrase = useCallback(async () => {
    if (!recoveryPassphraseEnabled) {
      throw new WorkspaceRecoveryError("Recovery passphrase is not enabled.");
    }

    const available = await checkBiometricAvailability();
    if (!available) {
      throw new WorkspaceRecoveryError(
        "Biometrics are required to reveal your recovery passphrase."
      );
    }

    await authenticateOnce("Authenticate to reveal recovery passphrase");

    const passphrase = await recoveryPassphraseStore.getRecoveryPassphrase();
    if (!passphrase) {
      throw new WorkspaceRecoveryError(
        "No recovery passphrase found. Turn it off and on again in settings."
      );
    }
    return passphrase;
  }, [recoveryPassphraseEnabled]);

  return {
    recoveryPassphraseEnabled,
    biometricAvailable,
    busy,
    setBusy,
    enableRecoveryPassphrase,
    disableRecoveryPassphrase,
    revealRecoveryPassphrase,
  };
}
