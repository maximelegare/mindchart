import * as SecureStore from "expo-secure-store";

const RECOVERY_PASSPHRASE_KEY = "device_recovery_passphrase";

const baseOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export async function getRecoveryPassphrase(): Promise<string | null> {
  return SecureStore.getItemAsync(RECOVERY_PASSPHRASE_KEY, baseOptions);
}

export async function setRecoveryPassphrase(passphrase: string): Promise<void> {
  await SecureStore.setItemAsync(
    RECOVERY_PASSPHRASE_KEY,
    passphrase,
    baseOptions
  );
}

export async function deleteRecoveryPassphrase(): Promise<void> {
  await SecureStore.deleteItemAsync(RECOVERY_PASSPHRASE_KEY, baseOptions);
}

export async function hasRecoveryPassphrase(): Promise<boolean> {
  const value = await getRecoveryPassphrase();
  return value != null && value.length > 0;
}
