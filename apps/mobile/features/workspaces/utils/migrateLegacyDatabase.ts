import * as FileSystem from "expo-file-system/legacy";
import {
  useWorkspacesStore,
  type Workspace,
} from "../context/workspacesContext";

const LEGACY_DB_NAME = "mindchart.db";

/**
 * Detects an existing legacy single-database install (databases/mindchart.db)
 * and adopts it as a "Default" workspace so users don't lose data when the
 * multi-workspace system takes over.
 *
 * Idempotent: safe to call on every app boot.
 */
export const migrateLegacyDatabase = async (): Promise<Workspace | null> => {
  const { workspaces, addWorkspace, setActiveWorkspaceId } =
    useWorkspacesStore.getState();

  if (workspaces.length > 0) return null;

  const legacyPath = `${FileSystem.documentDirectory}databases/${LEGACY_DB_NAME}`;
  const info = await FileSystem.getInfoAsync(legacyPath);
  if (!info.exists) return null;

  const workspace: Workspace = {
    id: "legacy-default",
    name: "Default",
    dbFileName: LEGACY_DB_NAME,
    createdAt: Date.now(),
  };

  addWorkspace(workspace);
  setActiveWorkspaceId(workspace.id);
  return workspace;
};
