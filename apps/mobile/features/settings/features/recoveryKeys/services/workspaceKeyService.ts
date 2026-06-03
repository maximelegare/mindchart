import * as Crypto from "expo-crypto";
import { useSecuritySettingsPreferences } from "@/features/settings/context/security";
import * as keyStore from "../components/workspaceKeyStore";
import { WorkspaceKeyMissingError } from "./workspaceKeyErrors";

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
  const { biometricRecoveryEnabled } =
    useSecuritySettingsPreferences.getState();
  if (!biometricRecoveryEnabled) return;
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
