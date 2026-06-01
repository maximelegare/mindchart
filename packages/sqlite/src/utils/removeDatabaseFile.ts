import * as FileSystem from "expo-file-system/legacy";
export async function removeDatabaseFile(name?: string) {
  const dbName = name || "mindchart.db";
  return await FileSystem.deleteAsync(
    `${FileSystem.documentDirectory}databases/${dbName}`,
    { idempotent: true }
  );
}
