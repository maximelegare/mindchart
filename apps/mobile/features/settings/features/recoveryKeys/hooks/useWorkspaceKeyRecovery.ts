import { useCallback, useEffect, useState } from "react";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import { useSecuritySettingsPreferences } from "@/features/settings/context/security";
import * as keyStore from "../components/workspaceKeyStore";
import { WorkspaceRecoveryError } from "../workspaceKeyErrors";

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
  });
  if (!result.success) {
    throw new WorkspaceRecoveryError("Authentication cancelled.");
  }
}

export function useWorkspaceKeyRecovery() {
  const biometricRecoveryEnabled = useSecuritySettingsPreferences(
    (s) => s.biometricRecoveryEnabled
  );
  const setBiometricRecoveryEnabled = useSecuritySettingsPreferences(
    (s) => s.setBiometricRecoveryEnabled
  );

  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    checkBiometricAvailability().then(setBiometricAvailable);
  }, []);

  const setupBiometricRecovery = useCallback(
    async (workspaceIds: string[], enabled: boolean) => {
      if (enabled) {
        const available = await checkBiometricAvailability();
        if (!available) {
          throw new WorkspaceRecoveryError(
            "Biometrics are not available on this device."
          );
        }

        await authenticateOnce("Authenticate to enable biometric recovery");

        for (const id of workspaceIds) {
          const key = await keyStore.getPrimaryKey(id);
          if (key) {
            await keyStore.setRecoveryKey(id, key);
          }
        }
        setBiometricRecoveryEnabled(true);
        return;
      }

      setBiometricRecoveryEnabled(false);
      for (const id of workspaceIds) {
        await keyStore.deleteRecoveryKey(id);
      }
    },
    [setBiometricRecoveryEnabled]
  );

  const recoverDatabaseKey = useCallback(
    async (workspaceId: string) => {
      if (!biometricRecoveryEnabled) {
        throw new WorkspaceRecoveryError("Biometric recovery is not enabled.");
      }

      await authenticateOnce("Authenticate to recover database key");

      const key = await keyStore.getRecoveryKey(workspaceId);
      if (!key) {
        throw new WorkspaceRecoveryError(
          "No recovery backup for this workspace. Turn biometric recovery off and on again in settings."
        );
      }
      return key;
    },
    [biometricRecoveryEnabled]
  );

  return {
    biometricRecoveryEnabled,
    biometricAvailable,
    busy,
    setBusy,
    setupBiometricRecovery,
    recoverDatabaseKey,
  };
}
