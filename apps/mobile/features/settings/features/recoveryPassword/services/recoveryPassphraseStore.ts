import * as SecureStore from "expo-secure-store";

const RECOVERY_PASSPHRASE_KEY = "device_recovery_passphrase";
const RECOVERY_SALT_KEY = "device_recovery_salt";
const RECOVERY_DERIVED_KEY = "device_recovery_derived_key";

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

export async function getRecoverySalt(): Promise<string | null> {
  return SecureStore.getItemAsync(RECOVERY_SALT_KEY, baseOptions);
}

export async function setRecoverySalt(saltBase64: string): Promise<void> {
  await SecureStore.setItemAsync(RECOVERY_SALT_KEY, saltBase64, baseOptions);
}

export async function getRecoveryDerivedKey(): Promise<string | null> {
  return SecureStore.getItemAsync(RECOVERY_DERIVED_KEY, baseOptions);
}

export async function setRecoveryDerivedKey(
  derivedKeyBase64: string
): Promise<void> {
  await SecureStore.setItemAsync(
    RECOVERY_DERIVED_KEY,
    derivedKeyBase64,
    baseOptions
  );
}

export async function deleteRecoveryPassphrase(): Promise<void> {
  await SecureStore.deleteItemAsync(RECOVERY_PASSPHRASE_KEY, baseOptions);
}

export async function deleteRecoverySalt(): Promise<void> {
  await SecureStore.deleteItemAsync(RECOVERY_SALT_KEY, baseOptions);
}

export async function deleteRecoveryDerivedKey(): Promise<void> {
  await SecureStore.deleteItemAsync(RECOVERY_DERIVED_KEY, baseOptions);
}

export async function hasRecoveryPassphrase(): Promise<boolean> {
  const value = await getRecoveryPassphrase();
  return value != null && value.length > 0;
}
