import * as SecureStore from "expo-secure-store";

const SECURE_STORE_PREFIX = "workspace_sqlcipher_key_";

const secureStoreKey = (workspaceId: string) =>
  `${SECURE_STORE_PREFIX}${workspaceId}`;

const secureStoreOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export async function getKey(workspaceId: string): Promise<string | null> {
  return SecureStore.getItemAsync(
    secureStoreKey(workspaceId),
    secureStoreOptions
  );
}

export async function setKey(workspaceId: string, key: string): Promise<void> {
  await SecureStore.setItemAsync(
    secureStoreKey(workspaceId),
    key,
    secureStoreOptions
  );
}

export async function deleteKey(workspaceId: string): Promise<void> {
  await SecureStore.deleteItemAsync(
    secureStoreKey(workspaceId),
    secureStoreOptions
  );
}

export async function hasKey(workspaceId: string): Promise<boolean> {
  const value = await getKey(workspaceId);
  return value != null && value.length > 0;
}
