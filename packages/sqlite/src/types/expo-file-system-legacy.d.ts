// Type declaration for expo-file-system/legacy to prevent TypeScript from checking source files in node_modules
// This shadows the actual implementation to prevent TypeScript errors
declare module "expo-file-system/legacy" {
  export const documentDirectory: string | null;
  export const cacheDirectory: string | null;
  export const bundleDirectory: string | null;

  export interface FileInfo {
    exists: boolean;
    uri: string;
    size?: number;
    isDirectory?: boolean;
    modificationTime?: number;
    md5?: string;
  }

  export interface DownloadResumable {
    downloadAsync(): Promise<FileInfo | null>;
    pauseAsync(): Promise<FileInfo | null>;
    resumeAsync(): Promise<FileInfo | null>;
    savable(): { url: string; uri: string; options: Record<string, unknown> };
  }

  export function deleteAsync(
    fileUri: string,
    options?: { idempotent?: boolean }
  ): Promise<void>;
  export function getInfoAsync(
    fileUri: string,
    options?: Record<string, unknown>
  ): Promise<FileInfo>;
  export function makeDirectoryAsync(
    dirUri: string,
    options?: { intermediates?: boolean }
  ): Promise<void>;
  export function copyAsync(options: {
    from: string;
    to: string;
  }): Promise<FileInfo>;
  export function createDownloadResumable(
    uri: string,
    fileUri: string,
    options?: Record<string, unknown>,
    callback?: (progress: {
      totalBytesWritten: number;
      totalBytesExpectedToWrite: number;
    }) => void
  ): DownloadResumable;

  export interface FileSystem {
    documentDirectory: string | null;
    cacheDirectory: string | null;
    bundleDirectory: string | null;
    deleteAsync: typeof deleteAsync;
    getInfoAsync: typeof getInfoAsync;
    makeDirectoryAsync: typeof makeDirectoryAsync;
    copyAsync: typeof copyAsync;
    [key: string]: unknown;
  }

  const FileSystem: FileSystem;
  export default FileSystem;
}

// Prevent TypeScript from checking source files in node_modules
declare module "expo-modules-core" {
  export function requireOptionalNativeModule(name: string): any;
  export class NativeModule<T = any> {
    [key: string]: any;
  }
  export class UnavailabilityError extends Error {
    constructor(
      moduleName: string,
      propertyName: string,
      options?: ErrorOptions
    );
  }
  export function uuid(): string;
  export namespace uuid {
    export function v4(): string;
  }
  export type EventSubscription = {
    remove: () => void;
  };
}
