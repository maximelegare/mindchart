import { useControllers } from "@/api/controllers/useControllers";
import {
  closeOPDatabase,
  getActiveDbName,
  getDbLocation,
  removeDatabaseFile,
  runMigrations,
  setActiveWorkspace as setActiveWorkspaceDb,
} from "@repo/sqlite";
import * as FileSystem from "expo-file-system/legacy";
import { useCallback, useState } from "react";
import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import { useQueryClient } from "@tanstack/react-query";
import { useModal } from "@/components/ui/modal/modal";
import {
  useWorkspacesStore,
  type Workspace,
} from "../context/workspacesContext";
import { generateWorkspaceId, workspaceDbFileName } from "../utils/workspaceId";

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

export const useWorkSpaces = () => {
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { openModal, closeModal } = useModal();

  const { useExportDatabaseMutation } = useControllers().settings;
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
    queryClient.clear();
    await queryClient.refetchQueries({ type: "active" });
  }, [queryClient]);

  /**
   * Point the SQLite singleton at the given workspace's file and reset
   * react-query caches so screens refetch against the new DB.
   */
  const activateWorkspace = useCallback(
    async (workspace: Workspace) => {
      await closeOPDatabase();
      await setActiveWorkspaceDb(workspace.dbFileName);
      setActiveWorkspaceId(workspace.id);
      bumpDbEpoch();
      await resetCaches();
    },
    [bumpDbEpoch, resetCaches, setActiveWorkspaceId]
  );

  const createWorkspace = useCallback(
    async (name: string): Promise<Workspace> => {
      setLoading(true);
      try {
        const id = generateWorkspaceId();
        const workspace: Workspace = {
          id,
          name: name.trim() || "Untitled Workspace",
          dbFileName: workspaceDbFileName(id),
          createdAt: Date.now(),
        };
        await ensureDatabasesDir();
        addWorkspace(workspace);
        await activateWorkspace(workspace);
        // Initialize the empty file: drizzle migrations + seed + FTS table.
        await runMigrations();
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
    async (id: string, name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      updateWorkspace(id, { name: trimmed });
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
    async (id?: string) => {
      setLoading(true);
      try {
        const state = useWorkspacesStore.getState();
        const target = state.workspaces.find(
          (w) => w.id === (id ?? state.activeWorkspaceId)
        );
        if (!target) {
          setLoading(false);
          return { success: false, error: new Error("No workspace selected") };
        }

        const isActive = state.activeWorkspaceId === target.id;
        const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
        const exportFileName = `${target.name.replace(/[^a-z0-9-_]+/gi, "_")}-${timestamp}.db`;
        const exportUri = FileSystem.cacheDirectory + exportFileName;

        if (isActive) {
          // VACUUM INTO via the live connection produces a clean snapshot.
          const sqlitePath = exportUri.replace("file://", "");
          await exportDatabaseAsync(sqlitePath);
        } else {
          // Inactive workspaces aren't open; copy the file directly.
          await FileSystem.copyAsync({
            from: `file://${dbPathFor(target)}`,
            to: exportUri,
          });
        }

        await Sharing.shareAsync(exportUri);
        await FileSystem.deleteAsync(exportUri, { idempotent: true });

        return { success: true };
      } catch (error) {
        console.error("Workspace export failed:", error);
        return { success: false, error };
      } finally {
        setLoading(false);
      }
    },
    [exportDatabaseAsync]
  );

  /**
   * Internal: copy the picked file into the destination workspace's slot,
   * close/reopen the DB singleton, and refetch queries.
   */
  const writeImportedFile = useCallback(
    async (backupUri: string, target: Workspace) => {
      await ensureDatabasesDir();

      const state = useWorkspacesStore.getState();
      const isActive = state.activeWorkspaceId === target.id;
      if (isActive || getActiveDbName() === target.dbFileName) {
        await closeOPDatabase();
      }

      const destUri = `file://${dbPathFor(target)}`;
      await FileSystem.deleteAsync(destUri, { idempotent: true });
      await FileSystem.copyAsync({ from: backupUri, to: destUri });

      await activateWorkspace(target);
      // Apply any pending migrations the imported file is missing.
      await runMigrations();
    },
    [activateWorkspace]
  );

  /**
   * DocumentPicker -> ask user "new workspace" vs "overwrite active" -> apply.
   */
  const importWorkspace = useCallback(async () => {
    setLoading(true);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        setLoading(false);
        return { success: false, canceled: true };
      }

      const backupUri = result.assets[0].uri;
      const state = useWorkspacesStore.getState();
      const hasActive = !!state.activeWorkspaceId;

      // No active workspace: import always creates a new one.
      if (!hasActive) {
        const id = generateWorkspaceId();
        const newWorkspace: Workspace = {
          id,
          name: "Imported Workspace",
          dbFileName: workspaceDbFileName(id),
          createdAt: Date.now(),
        };
        addWorkspace(newWorkspace);
        await writeImportedFile(backupUri, newWorkspace);
        setLoading(false);
        return { success: true, workspace: newWorkspace };
      }

      return await new Promise<{
        success: boolean;
        workspace?: Workspace;
        error?: unknown;
      }>((resolve) => {
        openModal({
          modalName: "IMPORT_WORKSPACE_CHOICE",
          confirmButton: { text: "New workspace" },
          cancelButton: {
            text: "Overwrite active",
            variant: "destructive",
          },
          onConfirm: async () => {
            try {
              const id = generateWorkspaceId();
              const newWorkspace: Workspace = {
                id,
                name: "Imported Workspace",
                dbFileName: workspaceDbFileName(id),
                createdAt: Date.now(),
              };
              addWorkspace(newWorkspace);
              await writeImportedFile(backupUri, newWorkspace);
              closeModal();
              resolve({ success: true, workspace: newWorkspace });
            } catch (error) {
              console.error("Import (new workspace) failed:", error);
              closeModal();
              resolve({ success: false, error });
            } finally {
              setLoading(false);
            }
          },
          onCancel: async () => {
            try {
              const active = useWorkspacesStore
                .getState()
                .workspaces.find(
                  (w) =>
                    w.id === useWorkspacesStore.getState().activeWorkspaceId
                );
              if (!active) {
                resolve({
                  success: false,
                  error: new Error("No active workspace"),
                });
                return;
              }
              await writeImportedFile(backupUri, active);
              resolve({ success: true, workspace: active });
            } catch (error) {
              console.error("Import (overwrite) failed:", error);
              resolve({ success: false, error });
            } finally {
              setLoading(false);
            }
          },
        });
      });
    } catch (error) {
      console.error("Workspace import failed:", error);
      setLoading(false);
      return { success: false, error };
    }
  }, [addWorkspace, closeModal, openModal, writeImportedFile]);

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
