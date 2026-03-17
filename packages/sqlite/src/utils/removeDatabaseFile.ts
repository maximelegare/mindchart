import * as FileSystem from "expo-file-system/legacy";
export async function removeDatabaseFile() {
  return await FileSystem.deleteAsync(
    `${FileSystem.documentDirectory}databases/mindchart.db`,
    { idempotent: true }
  );
}
