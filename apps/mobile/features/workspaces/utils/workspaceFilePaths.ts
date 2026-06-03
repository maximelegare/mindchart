import * as FileSystem from "expo-file-system/legacy";
import { getDbLocation } from "@repo/sqlite";

/** Strip `file://` prefix for native SQLite / blob-util paths. */
export const toNativePath = (uri: string): string =>
  uri.replace(/^file:\/\//, "");

/** Ensure a filesystem path is a `file://` URI for expo-file-system. */
export const toFileUri = (path: string): string =>
  path.startsWith("file://") ? path : `file://${path}`;

const SQLITE_SIDEcarSuffixes = ["-wal", "-shm", "-journal"] as const;

/** Remove main DB file and SQLite sidecars so a full replace cannot replay old WAL data. */
export const deleteWorkspaceDatabaseFiles = async (
  dbFileName: string
): Promise<void> => {
  const base = `${toNativePath(getDbLocation())}/${dbFileName}`;
  await FileSystem.deleteAsync(toFileUri(base), { idempotent: true });
  for (const suffix of SQLITE_SIDEcarSuffixes) {
    await FileSystem.deleteAsync(toFileUri(`${base}${suffix}`), {
      idempotent: true,
    });
  }
};
