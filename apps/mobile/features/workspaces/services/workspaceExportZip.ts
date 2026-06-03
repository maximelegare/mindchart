import * as FileSystem from "expo-file-system/legacy";
import RNBlobUtil from "react-native-blob-util";
import { zip, unzip } from "fflate";
import { Buffer } from "buffer";
import {
  metadataToJson,
  parseExportMetadata,
  type WorkspaceExportMetadata,
} from "./workspaceExportCrypto";
import { WorkspaceExportInvalidArchiveError } from "./workspaceExportErrors";
import { debugExportLog } from "../utils/debugExportLog";

export const WORKSPACE_DB_ENTRY = "workspace.db";
export const METADATA_ENTRY = "metadata.json";

const filePathFromUri = (uri: string): string =>
  uri.startsWith("file://") ? uri.replace("file://", "") : uri;

const readFileAsBytes = async (uri: string): Promise<Uint8Array> => {
  const path = filePathFromUri(uri);
  const base64 = await RNBlobUtil.fs.readFile(path, "base64");
  return new Uint8Array(Buffer.from(base64, "base64"));
};

const writeBytesToFile = async (
  uri: string,
  bytes: Uint8Array
): Promise<void> => {
  const path = filePathFromUri(uri);
  const base64 = Buffer.from(bytes).toString("base64");
  await RNBlobUtil.fs.writeFile(path, base64, "base64");
};

const zipAsync = (files: Record<string, Uint8Array>): Promise<Uint8Array> =>
  new Promise((resolve, reject) => {
    zip(files, { level: 0 }, (err, data) => {
      if (err) reject(err);
      else resolve(data);
    });
  });

const unzipAsync = (data: Uint8Array): Promise<Record<string, Uint8Array>> =>
  new Promise((resolve, reject) => {
    unzip(data, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
  });

const findEntry = (
  archive: Record<string, Uint8Array>,
  name: string
): Uint8Array | undefined => {
  if (archive[name]) return archive[name];
  const suffix = `/${name}`;
  const match = Object.entries(archive).find(([path]) => path.endsWith(suffix));
  return match?.[1];
};

export const buildWorkspaceExportZip = async (
  dbUri: string,
  metadata: WorkspaceExportMetadata
): Promise<string> => {
  try {
    debugExportLog(
      "workspaceExportZip.ts:build:start",
      "read db for zip",
      { dbUri, path: filePathFromUri(dbUri) },
      "C"
    );
    const dbBytes = await readFileAsBytes(dbUri);
    debugExportLog(
      "workspaceExportZip.ts:build:read-ok",
      "db read ok",
      { byteLength: dbBytes.length },
      "C"
    );
    const metadataBytes = new TextEncoder().encode(metadataToJson(metadata));
    const zipBytes = await zipAsync({
      [WORKSPACE_DB_ENTRY]: dbBytes,
      [METADATA_ENTRY]: metadataBytes,
    });
    debugExportLog(
      "workspaceExportZip.ts:build:zip-ok",
      "zip created",
      { zipByteLength: zipBytes.length },
      "C"
    );

    const zipUri = `${FileSystem.cacheDirectory}workspace-export-${Date.now()}.zip`;
    await writeBytesToFile(zipUri, zipBytes);
    return zipUri;
  } catch (error) {
    const err = error as Error;
    debugExportLog(
      "workspaceExportZip.ts:build:catch",
      "zip build failed",
      { name: err?.name, message: err?.message },
      "C"
    );
    throw error;
  }
};

export type ExtractedWorkspaceExport = {
  dbBytes: Uint8Array;
  metadata: WorkspaceExportMetadata;
};

export const extractWorkspaceExportZip = async (
  zipUri: string
): Promise<ExtractedWorkspaceExport> => {
  let zipBytes: Uint8Array;
  try {
    zipBytes = await readFileAsBytes(zipUri);
  } catch {
    throw new WorkspaceExportInvalidArchiveError("Could not read zip file");
  }

  let archive: Record<string, Uint8Array>;
  try {
    archive = await unzipAsync(zipBytes);
  } catch {
    throw new WorkspaceExportInvalidArchiveError("Could not unzip archive");
  }

  const dbBytes = findEntry(archive, WORKSPACE_DB_ENTRY);
  const metadataBytes = findEntry(archive, METADATA_ENTRY);

  if (!dbBytes || !metadataBytes) {
    throw new WorkspaceExportInvalidArchiveError(
      `Archive must contain ${WORKSPACE_DB_ENTRY} and ${METADATA_ENTRY}`
    );
  }

  const metadataJson = new TextDecoder().decode(metadataBytes);
  const metadata = parseExportMetadata(metadataJson);

  return { dbBytes, metadata };
};

export const writeDbBytesToUri = async (
  uri: string,
  dbBytes: Uint8Array
): Promise<void> => {
  await writeBytesToFile(uri, dbBytes);
};
