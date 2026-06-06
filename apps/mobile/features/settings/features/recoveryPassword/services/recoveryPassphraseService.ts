import * as Crypto from "expo-crypto";
import { Buffer } from "buffer";
import {
  deriveRecoveryExportKey,
  type RecoveryExportMaterial,
} from "@/features/workspaces/services/workspaceExportCrypto";
import * as store from "./recoveryPassphraseStore";

const SALT_LENGTH = 16;

const toBase64 = (bytes: Uint8Array): string =>
  Buffer.from(bytes).toString("base64");

const fromBase64 = (b64: string): Uint8Array =>
  new Uint8Array(Buffer.from(b64, "base64"));

export async function setupRecoveryCredentials(
  passphrase: string
): Promise<void> {
  const saltBytes = await Crypto.getRandomBytesAsync(SALT_LENGTH);
  const derivedKey = await deriveRecoveryExportKey(passphrase, saltBytes);

  await store.setRecoveryPassphrase(passphrase);
  await store.setRecoverySalt(toBase64(saltBytes));
  await store.setRecoveryDerivedKey(toBase64(derivedKey));
}

export async function getRecoveryExportMaterial(): Promise<RecoveryExportMaterial | null> {
  const saltBase64 = await store.getRecoverySalt();
  const derivedKeyBase64 = await store.getRecoveryDerivedKey();
  if (!saltBase64 || !derivedKeyBase64) return null;

  return {
    saltBase64,
    derivedKey: fromBase64(derivedKeyBase64),
  };
}

export async function getStoredRecoveryPassphrase(): Promise<string | null> {
  return store.getRecoveryPassphrase();
}

export async function clearRecoveryPassphrase(): Promise<void> {
  await store.deleteRecoveryPassphrase();
  await store.deleteRecoverySalt();
  await store.deleteRecoveryDerivedKey();
}
