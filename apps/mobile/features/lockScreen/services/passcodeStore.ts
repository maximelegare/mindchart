import * as SecureStore from "expo-secure-store";

const APP_PIN_HASH_KEY = "app_lock_pin_hash";
const APP_PIN_SALT_KEY = "app_lock_pin_salt";

const baseOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export async function getPinHash(): Promise<string | null> {
  return SecureStore.getItemAsync(APP_PIN_HASH_KEY, baseOptions);
}

export async function setPinHash(hashBase64: string): Promise<void> {
  await SecureStore.setItemAsync(APP_PIN_HASH_KEY, hashBase64, baseOptions);
}

export async function getPinSalt(): Promise<string | null> {
  return SecureStore.getItemAsync(APP_PIN_SALT_KEY, baseOptions);
}

export async function setPinSalt(saltBase64: string): Promise<void> {
  await SecureStore.setItemAsync(APP_PIN_SALT_KEY, saltBase64, baseOptions);
}

export async function deletePinHash(): Promise<void> {
  await SecureStore.deleteItemAsync(APP_PIN_HASH_KEY, baseOptions);
}

export async function deletePinSalt(): Promise<void> {
  await SecureStore.deleteItemAsync(APP_PIN_SALT_KEY, baseOptions);
}
