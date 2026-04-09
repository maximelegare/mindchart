import { useControllers } from "@/api/controllers/useControllers";
import { getOPDatabase, closeOPDatabase } from "@repo/sqlite";
import * as FileSystem from "expo-file-system/legacy";
import { useState } from "react";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { useQueryClient } from "@tanstack/react-query";
import { REACT_QUERY_KEYS } from "@/api/endpoints/KEYS";

export const useDatabaseBackup = () => {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const { useExportDatabaseMutation } = useControllers().settings;
  const { mutateAsync: exportDatabaseAsync } = useExportDatabaseMutation();

  const exportDatabase = async () => {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
      const exportFileName = `mindchart-${timestamp}.db`;
      const exportUri = FileSystem.cacheDirectory + exportFileName;
      const sqlitePath = exportUri.replace("file://", "");

      await exportDatabaseAsync(sqlitePath);

      // Open system share sheet
      await Sharing.shareAsync(exportUri);

      // Cleanup temporary file
      await FileSystem.deleteAsync(exportUri, { idempotent: true });

      setLoading(false);
      return { success: true };
    } catch (error) {
      console.error("Database export failed:", error);
      setLoading(false);
      return { success: false, error };
    }
  };

  const importDatabase = async () => {
    setLoading(true);
    try {
      // Pick backup file
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setLoading(false);
        return { success: false, canceled: true };
      }

      const backupUri = result.assets[0].uri;

      // Get DB info
      const dbName = "files/SQLite/mindchart.db";
      if (!dbName) throw new Error("Missing DB name env variable");

      const dbDir = FileSystem.documentDirectory + "databases/";
      const dbFileUri = dbDir + dbName;

      // Ensure folder exists
      const dirInfo = await FileSystem.getInfoAsync(dbDir);
      if (!dirInfo.exists) {
        await FileSystem.makeDirectoryAsync(dbDir, { intermediates: true });
      }

      // Close the database connection and reset the cached instance
      try {
        await closeOPDatabase();
      } catch (error) {
        console.error("Error closing database:", error);
      }

      // Copy backup over the current DB
      await FileSystem.copyAsync({
        from: backupUri,
        to: dbFileUri,
      });

      // Reopen DB
      const db = getOPDatabase();

      // Reset all queries - this clears cache and forces refetch on next mount
      Object.values(REACT_QUERY_KEYS).forEach((key) => {
        queryClient.resetQueries({ queryKey: [key] });
      });

      // Clear the entire cache
      queryClient.clear();

      // Force refetch all active queries
      await queryClient.refetchQueries({
        type: "active",
      });

      setLoading(false);
      return { success: true, db };
    } catch (error) {
      console.error("Database import failed:", error);
      setLoading(false);
      return { success: false, error };
    }
  };

  return { exportDatabase, importDatabase, loading };
};
