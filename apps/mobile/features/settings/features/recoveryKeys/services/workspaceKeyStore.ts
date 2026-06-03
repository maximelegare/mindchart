import * as SecureStore from "expo-secure-store";

const PRIMARY_PREFIX = "workspace_sqlcipher_key_";
const RECOVERY_PREFIX = "workspace_sqlcipher_recovery_";

const primaryKey = (workspaceId: string) => `${PRIMARY_PREFIX}${workspaceId}`;
const recoveryKey = (workspaceId: string) => `${RECOVERY_PREFIX}${workspaceId}`;

const baseOptions: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

export async function getPrimaryKey(
  workspaceId: string
): Promise<string | null> {
  return SecureStore.getItemAsync(primaryKey(workspaceId), baseOptions);
}

export async function setPrimaryKey(
  workspaceId: string,
  key: string
): Promise<void> {
  await SecureStore.setItemAsync(primaryKey(workspaceId), key, baseOptions);
}

export async function deletePrimaryKey(workspaceId: string): Promise<void> {
  await SecureStore.deleteItemAsync(primaryKey(workspaceId), baseOptions);
}

export async function hasPrimaryKey(workspaceId: string): Promise<boolean> {
  const value = await getPrimaryKey(workspaceId);
  return value != null && value.length > 0;
}

export async function getRecoveryKey(
  workspaceId: string
): Promise<string | null> {
  return SecureStore.getItemAsync(recoveryKey(workspaceId), baseOptions);
}

/** Writes recovery backups without prompting (biometric gate is in the manager). */
export async function setRecoveryKey(
  workspaceId: string,
  key: string
): Promise<void> {
  await SecureStore.setItemAsync(recoveryKey(workspaceId), key, baseOptions);
}

export async function deleteRecoveryKey(workspaceId: string): Promise<void> {
  await SecureStore.deleteItemAsync(recoveryKey(workspaceId), baseOptions);
}

// Back-compat aliases
export const getKey = getPrimaryKey;
export const setKey = setPrimaryKey;
export const deleteKey = deletePrimaryKey;
export const hasKey = hasPrimaryKey;
