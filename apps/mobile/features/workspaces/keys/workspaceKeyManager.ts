import * as Crypto from "expo-crypto";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";
import * as keyStore from "./workspaceKeyStore";
import {
  isBiometricRecoveryEnabled,
  setBiometricRecoveryEnabled,
} from "./workspaceUnlockPrefs";

export class WorkspaceKeyMissingError extends Error {
  readonly workspaceId: string;

  constructor(workspaceId: string) {
    super(`No encryption key found for workspace ${workspaceId}`);
    this.name = "WorkspaceKeyMissingError";
    this.workspaceId = workspaceId;
  }
}

export class WorkspaceRecoveryError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WorkspaceRecoveryError";
  }
}

async function generateEncryptionKey(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(32);
  return Array.from(bytes as Uint8Array, (b: number) =>
    b.toString(16).padStart(2, "0")
  ).join("");
}

async function syncRecoveryBackup(
  workspaceId: string,
  key: string
): Promise<void> {
  if (!isBiometricRecoveryEnabled()) return;
  await keyStore.setRecoveryKey(workspaceId, key);
}

export async function createKeyForWorkspace(
  workspaceId: string
): Promise<string> {
  const key = await generateEncryptionKey();
  await keyStore.setPrimaryKey(workspaceId, key);
  await syncRecoveryBackup(workspaceId, key);
  return key;
}

export async function getKeyForWorkspace(
  workspaceId: string
): Promise<string | null> {
  return keyStore.getPrimaryKey(workspaceId);
}

export async function deleteKeyForWorkspace(
  workspaceId: string
): Promise<void> {
  await keyStore.deletePrimaryKey(workspaceId);
  await keyStore.deleteRecoveryKey(workspaceId);
}

export async function hasKeyForWorkspace(
  workspaceId: string
): Promise<boolean> {
  return keyStore.hasPrimaryKey(workspaceId);
}

export async function assertKeyExists(workspaceId: string): Promise<string> {
  const key = await getKeyForWorkspace(workspaceId);
  if (!key) {
    throw new WorkspaceKeyMissingError(workspaceId);
  }
  return key;
}

export async function canUseBiometricRecovery(): Promise<boolean> {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  const isEnrolled = await LocalAuthentication.isEnrolledAsync();
  return (
    hasHardware && isEnrolled && SecureStore.canUseBiometricAuthentication()
  );
}

export { isBiometricRecoveryEnabled };

export async function setupBiometricRecovery(
  workspaceIds: string[],
  enabled: boolean
): Promise<void> {
  if (enabled) {
    const ok = await canUseBiometricRecovery();
    if (!ok) {
      throw new WorkspaceRecoveryError(
        "Biometrics are not available on this device."
      );
    }
    setBiometricRecoveryEnabled(true);
    for (const id of workspaceIds) {
      const key = await keyStore.getPrimaryKey(id);
      if (key) {
        await keyStore.setRecoveryKey(id, key);
      }
    }
    return;
  }

  setBiometricRecoveryEnabled(false);
  for (const id of workspaceIds) {
    await keyStore.deleteRecoveryKey(id);
  }
}

/** Biometric prompt happens here only — used from the recovery screen. */
export async function recoverDatabaseKey(workspaceId: string): Promise<string> {
  if (!isBiometricRecoveryEnabled()) {
    throw new WorkspaceRecoveryError("Biometric recovery is not enabled.");
  }

  const key = await keyStore.getRecoveryKey(workspaceId);
  if (!key) {
    throw new WorkspaceRecoveryError(
      "No recovery backup for this workspace. Turn biometric recovery off and on again in settings."
    );
  }
  return key;
}
