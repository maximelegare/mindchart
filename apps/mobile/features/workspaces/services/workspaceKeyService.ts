import * as Crypto from "expo-crypto";
import * as keyStore from "./workspaceKeyStore";
import { WorkspaceKeyMissingError } from "./workspaceKeyErrors";

async function generateEncryptionKey(): Promise<string> {
  const bytes = await Crypto.getRandomBytesAsync(32);
  return Array.from(bytes as Uint8Array, (b: number) =>
    b.toString(16).padStart(2, "0")
  ).join("");
}

export async function createKeyForWorkspace(
  workspaceId: string
): Promise<string> {
  const key = await generateEncryptionKey();
  await storeKeyForWorkspace(workspaceId, key);
  return key;
}

export async function storeKeyForWorkspace(
  workspaceId: string,
  key: string
): Promise<void> {
  await keyStore.setPrimaryKey(workspaceId, key);
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
