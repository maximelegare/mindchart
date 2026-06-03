import { useSettingsController } from "@/api/controllers/useSettingsController";
import {
  closeOPDatabase,
  getActiveDbName,
  getDbLocation,
  removeDatabaseFile,
  runMigrations,
  setActiveWorkspace as setActiveWorkspaceDb,
  setWorkspaceEncryptionKey,
} from "@repo/sqlite";
import {
  assertKeyExists,
  createKeyForWorkspace,
  deleteKeyForWorkspace,
  getKeyForWorkspace,
  storeKeyForWorkspace,
} from "@/features/settings/features/recoveryKeys/services/workspaceKeyService";
import { WorkspaceKeyMissingError } from "@/features/settings/features/recoveryKeys/services/workspaceKeyErrors";
import * as FileSystem from "expo-file-system/legacy";
import React, { useCallback, useState } from "react";
import { ImportWorkspaceFlowModal } from "../components/modals/workspaceImportFlowModal";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { useQueryClient } from "@tanstack/react-query";
import { useModal } from "@/components/ui/modal/modal";
import {
  useWorkspacesStore,
  type Workspace,
} from "../context/workspacesContext";
import { generateWorkspaceId, workspaceDbFileName } from "../utils/workspaceId";
import { encryptSqlCipherKey } from "../services/workspaceExportCrypto";
import {
  buildWorkspaceExportZip,
  writeDbBytesToUri,
} from "../services/workspaceExportZip";
import {
  WorkspaceExportDecryptError,
  WorkspaceExportInvalidArchiveError,
} from "../services/workspaceExportErrors";
import {
  deleteWorkspaceDatabaseFiles,
  toFileUri,
  toNativePath,
} from "../utils/workspaceFilePaths";

export type { Workspace } from "../context/workspacesContext";

const DATABASES_DIR = `${FileSystem.documentDirectory}databases/`;

const ensureDatabasesDir = async () => {
  const dirInfo = await FileSystem.getInfoAsync(DATABASES_DIR);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(DATABASES_DIR, { intermediates: true });
  }
};

const dbPathFor = (workspace: Workspace) =>
  `${getDbLocation()}/${workspace.dbFileName}`;

const importErrorMessage = (error: unknown): string => {
  if (error instanceof WorkspaceExportDecryptError) {
    return "Wrong password or corrupted export metadata.";
  }
  if (error instanceof WorkspaceExportInvalidArchiveError) {
    return error.message;
  }
  return "Import failed. Please try again.";
};

export const useWorkSpaces = () => {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { openModal, closeModal } = useModal();

  const { useExportDatabaseMutation } = useSettingsController();
  const { mutateAsync: exportDatabaseAsync } = useExportDatabaseMutation();

  const workspaces = useWorkspacesStore((s) => s.workspaces);
  const activeWorkspaceId = useWorkspacesStore((s) => s.activeWorkspaceId);
  const addWorkspace = useWorkspacesStore((s) => s.addWorkspace);
  const removeWorkspaceFromStore = useWorkspacesStore((s) => s.removeWorkspace);
  const updateWorkspace = useWorkspacesStore((s) => s.updateWorkspace);
  const setActiveWorkspaceId = useWorkspacesStore(
    (s) => s.setActiveWorkspaceId
  );
  const bumpDbEpoch = useWorkspacesStore((s) => s.bumpDbEpoch);

  const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId);

  const resetCaches = useCallback(async () => {
    // `queryClient.clear()` removes queries from the cache entirely, which
    // means a subsequent `refetchQueries({ type: "active" })` finds nothing
    // to refetch — leaving mounted observers (e.g. NotesListFeature) stuck
    // showing stale data until something else invalidates them.
    // `resetQueries()` resets each query to its initial state AND refetches
    // active observers — exactly the workspace-switch semantics we want.
    await queryClient.resetQueries();
  }, [queryClient]);

  /**
   * Point the SQLite singleton at the given workspace's file, run any
   * pending migrations on it, and only THEN refresh react-query caches
   * so screens never query an unmigrated DB.
   */
  const activateWorkspace = useCallback(
    async (workspace: Workspace) => {
      const key = await getKeyForWorkspace(workspace.id);
      if (!key) {
        throw new WorkspaceKeyMissingError(workspace.id);
      }

      await closeOPDatabase();
      await setActiveWorkspaceDb(workspace.dbFileName);
      setWorkspaceEncryptionKey(key);
      // Critical: migrations must complete BEFORE any consumer query fires.
      // Otherwise refetchQueries({type:"active"}) below races migrate() and
      // observed queries (e.g. fetch_all_topics) hit a tableless DB.
      await runMigrations();
      setActiveWorkspaceId(workspace.id);
      bumpDbEpoch();
      await resetCaches();
    },
    [bumpDbEpoch, resetCaches, setActiveWorkspaceId]
  );

  const createWorkspace = useCallback(
    async (
      name: string,
      options?: { icon?: string; color?: [string, string] }
    ): Promise<Workspace> => {
      setLoading(true);
      try {
        const id = generateWorkspaceId();
        const workspace: Workspace = {
          id,
          name: name.trim() || "Untitled Workspace",
          icon: options?.icon,
          color: options?.color,
          dbFileName: workspaceDbFileName(id),
          createdAt: Date.now(),
        };
        await ensureDatabasesDir();
        await createKeyForWorkspace(id);
        addWorkspace(workspace);
        await activateWorkspace(workspace);
        return workspace;
      } finally {
        setLoading(false);
      }
    },
    [activateWorkspace, addWorkspace]
  );

  const switchWorkspace = useCallback(
    async (id: string) => {
      const target = useWorkspacesStore
        .getState()
        .workspaces.find((w) => w.id === id);
      if (!target) return;
      if (target.id === useWorkspacesStore.getState().activeWorkspaceId) return;
      setLoading(true);
      try {
        await activateWorkspace(target);
      } finally {
        setLoading(false);
      }
    },
    [activateWorkspace]
  );

  const renameWorkspace = useCallback(
    async (
      id: string,
      name: string,
      options?: { icon?: string; color?: [string, string] }
    ) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      updateWorkspace(id, {
        name: trimmed,
        ...(options?.icon !== undefined ? { icon: options.icon } : {}),
        ...(options?.color !== undefined ? { color: options.color } : {}),
      });
    },
    [updateWorkspace]
  );

  const deleteWorkspace = useCallback(
    async (id: string) => {
      setLoading(true);
      try {
        const state = useWorkspacesStore.getState();
        const target = state.workspaces.find((w) => w.id === id);
        if (!target) return;

        const isActive = state.activeWorkspaceId === id;
        if (isActive) {
          await closeOPDatabase();
        }
        await removeDatabaseFile(target.dbFileName);
        await deleteKeyForWorkspace(id);
        removeWorkspaceFromStore(id);

        if (isActive) {
          const remaining = useWorkspacesStore.getState().workspaces;
          const next = remaining[0];
          if (next) {
            await activateWorkspace(next);
          } else {
            setActiveWorkspaceId(null);
            bumpDbEpoch();
            await resetCaches();
          }
        }
      } finally {
        setLoading(false);
      }
    },
    [
      activateWorkspace,
      bumpDbEpoch,
      removeWorkspaceFromStore,
      resetCaches,
      setActiveWorkspaceId,
    ]
  );

  const exportWorkspace = useCallback(
    async (id: string, password: string) => {
      setLoading(true);
      let dbCacheUri: string | null = null;
      let shareZipUri: string | null = null;
      let exportSucceeded = false;
      try {
        const state = useWorkspacesStore.getState();
        const target = state.workspaces.find((w) => w.id === id);
        const isActive = state.activeWorkspaceId === target?.id;
        if (!target) {
          return { success: false, error: new Error("No workspace selected") };
        }

        const hexKey = await assertKeyExists(target.id);
        const metadata = await encryptSqlCipherKey(hexKey, password);

        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        dbCacheUri = `${FileSystem.cacheDirectory}workspace-export-${timestamp}.db`;

        if (isActive) {
          const sqlitePath = toNativePath(dbCacheUri);
          await exportDatabaseAsync(sqlitePath);
          const dbInfo = await FileSystem.getInfoAsync(dbCacheUri);
          if (!dbInfo.exists || !("size" in dbInfo) || !dbInfo.size) {
            throw new Error("Database snapshot was not created");
          }
        } else {
          const fromPath = toFileUri(dbPathFor(target));
          await FileSystem.copyAsync({ from: fromPath, to: dbCacheUri });
        }

        const tempZipUri = await buildWorkspaceExportZip(dbCacheUri, metadata);
        const zipFileName = `${target.name.replace(/[^a-z0-9-_]+/gi, "_")}-${timestamp}.zip`;
        shareZipUri = `${FileSystem.cacheDirectory}${zipFileName}`;
        await FileSystem.copyAsync({ from: tempZipUri, to: shareZipUri });
        await FileSystem.deleteAsync(tempZipUri, { idempotent: true });

        const canShare = await Sharing.isAvailableAsync();
        if (!canShare) {
          throw new Error("Sharing is not available on this device");
        }
        await Sharing.shareAsync(shareZipUri, {
          mimeType: "application/zip",
          dialogTitle: "Export workspace",
        });
        exportSucceeded = true;
        return { success: true };
      } catch (error) {
        console.error("Workspace export failed:", error);
        return { success: false, error };
      } finally {
        if (dbCacheUri) {
          await FileSystem.deleteAsync(dbCacheUri, { idempotent: true });
        }
        // Keep the shared zip on success — deleting it in finally broke the share sheet.
        if (shareZipUri && !exportSucceeded) {
          await FileSystem.deleteAsync(shareZipUri, { idempotent: true });
        }
        setLoading(false);
      }
    },
    [exportDatabaseAsync]
  );

  /**
   * Copy decrypted DB bytes into the destination workspace slot,
   * close/reopen the DB singleton, and refetch queries.
   * Caller must have stored the SQLCipher key via storeKeyForWorkspace first.
   */
  const writeImportedDb = useCallback(
    async (dbBytes: Uint8Array, target: Workspace) => {
      await ensureDatabasesDir();

      const state = useWorkspacesStore.getState();
      const isActive = state.activeWorkspaceId === target.id;
      const isOpenFile = getActiveDbName() === target.dbFileName;
      if (isActive || isOpenFile) {
        await closeOPDatabase();
      }

      const destUri = toFileUri(dbPathFor(target));
      await deleteWorkspaceDatabaseFiles(target.dbFileName);
      await writeDbBytesToUri(destUri, dbBytes);

      await activateWorkspace(target);
    },
    [activateWorkspace]
  );

  const applyImport = useCallback(
    async (dbBytes: Uint8Array, sqlcipherKey: string, target: Workspace) => {
      await storeKeyForWorkspace(target.id, sqlcipherKey);
      await writeImportedDb(dbBytes, target);
    },
    [writeImportedDb]
  );

  /**
   * DocumentPicker (.zip) -> password -> decrypt key -> new vs overwrite -> apply.
   */
  const importWorkspace = useCallback(async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ["application/zip", "application/x-zip-compressed", "*/*"],
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        return { success: false, canceled: true };
      }

      const zipUri = result.assets[0].uri;
      const importState = useWorkspacesStore.getState();
      const hasActive = !!importState.activeWorkspaceId;
      const activeForOverwrite = importState.workspaces.find(
        (w) => w.id === importState.activeWorkspaceId
      );
      setLoading(true);
      return await new Promise<{
        success: boolean;
        workspace?: Workspace;
        canceled?: boolean;
        error?: unknown;
      }>((resolve) => {
        openModal({
          dismissOnBackgroundPress: false,
          customContent: () =>
            React.createElement(ImportWorkspaceFlowModal, {
              zipUri,
              hasActiveWorkspace: hasActive,
              activeWorkspaceName: activeForOverwrite?.name ?? "this workspace",
              importErrorMessage,
              onCancel: () => {
                closeModal();
                setLoading(false);
                resolve({ success: false, canceled: true });
              },
              onComplete: (importResult) => {
                closeModal();
                setLoading(false);
                resolve(importResult);
              },
              onApplyNew: async (
                { dbBytes, sqlcipherKey },
                { name, color, icon }
              ) => {
                const id = generateWorkspaceId();
                const newWorkspace: Workspace = {
                  id,
                  name: name.trim() || "Imported Workspace",
                  icon,
                  color,
                  dbFileName: workspaceDbFileName(id),
                  createdAt: Date.now(),
                };
                addWorkspace(newWorkspace);
                await applyImport(dbBytes, sqlcipherKey, newWorkspace);
                return newWorkspace;
              },
              onApplyOverwrite: async ({ dbBytes, sqlcipherKey }) => {
                const active = useWorkspacesStore
                  .getState()
                  .workspaces.find(
                    (w) =>
                      w.id === useWorkspacesStore.getState().activeWorkspaceId
                  );
                if (!active) {
                  throw new Error("No active workspace");
                }
                await applyImport(dbBytes, sqlcipherKey, active);
                return active;
              },
            }),
        });
      });
    } catch (error) {
      console.error("Workspace import failed:", error);
      closeModal();
      setLoading(false);
      return { success: false, error };
    }
  }, [addWorkspace, applyImport, closeModal, openModal]);

  return {
    workspaces,
    activeWorkspaceId,
    activeWorkspace,
    createWorkspace,
    switchWorkspace,
    deleteWorkspace,
    renameWorkspace,
    exportWorkspace,
    importWorkspace,
    loading,
  };
};
