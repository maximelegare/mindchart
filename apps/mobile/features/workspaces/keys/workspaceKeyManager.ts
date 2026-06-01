import * as Crypto from "expo-crypto";
import * as keyStore from "./workspaceKeyStore";

export class WorkspaceKeyMissingError extends Error {
  readonly workspaceId: string;

  constructor(workspaceId: string) {
    super(`No encryption key found for workspace ${workspaceId}`);
    this.name = "WorkspaceKeyMissingError";
    this.workspaceId = workspaceId;
  }
}

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
  await keyStore.setKey(workspaceId, key);
  return key;
}

export async function getKeyForWorkspace(
  workspaceId: string
): Promise<string | null> {
  return keyStore.getKey(workspaceId);
}

export async function deleteKeyForWorkspace(
  workspaceId: string
): Promise<void> {
  await keyStore.deleteKey(workspaceId);
}

export async function hasKeyForWorkspace(
  workspaceId: string
): Promise<boolean> {
  return keyStore.hasKey(workspaceId);
}

export async function assertKeyExists(workspaceId: string): Promise<string> {
  const key = await getKeyForWorkspace(workspaceId);
  if (!key) {
    throw new WorkspaceKeyMissingError(workspaceId);
  }
  return key;
}
