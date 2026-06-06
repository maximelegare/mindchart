import * as store from "./recoveryPassphraseStore";

export async function storeRecoveryPassphrase(
  passphrase: string
): Promise<void> {
  await store.setRecoveryPassphrase(passphrase);
}

export async function getStoredRecoveryPassphrase(): Promise<string | null> {
  return store.getRecoveryPassphrase();
}

export async function clearRecoveryPassphrase(): Promise<void> {
  await store.deleteRecoveryPassphrase();
}
