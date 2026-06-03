/** Strip `file://` prefix for native SQLite / blob-util paths. */
export const toNativePath = (uri: string): string =>
  uri.replace(/^file:\/\//, "");

/** Ensure a filesystem path is a `file://` URI for expo-file-system. */
export const toFileUri = (path: string): string =>
  path.startsWith("file://") ? path : `file://${path}`;
