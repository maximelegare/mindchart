import { Directory } from "expo-file-system";
import { getDbLocation } from "@repo/sqlite";
import {
  useWorkspacesStore,
  type Workspace,
} from "../context/workspacesContext";
import { toFileUri } from "./workspaceFilePaths";

const LEGACY_DB_NAME = "mindchart.db";

const createdAtFromWorkspaceId = (id: string): number => {
  const match = /^ws_([0-9a-z]+)_/i.exec(id);
  if (!match) return Date.now();
  const parsed = Number.parseInt(match[1], 36);
  return Number.isFinite(parsed) ? parsed : Date.now();
};

/**
 * Re-register on-disk workspace files that are missing from the Zustand
 * list. Boot used to read workspaces before MMKV hydration finished and
 * could persist an empty list over the real one.
 */
export const recoverOrphanedWorkspaces = async (): Promise<void> => {
  const dir = new Directory(toFileUri(getDbLocation()));
  if (!dir.exists) return;

  let names: string[] = [];
  try {
    names = dir.list().map((entry) => entry.name);
  } catch (error) {
    console.warn("Could not list workspace database files", error);
    return;
  }

  const { workspaces, addWorkspace } = useWorkspacesStore.getState();
  const knownIds = new Set(workspaces.map((w) => w.id));
  const knownFiles = new Set(workspaces.map((w) => w.dbFileName));

  for (const file of names) {
    if (!file.endsWith(".db")) continue;
    if (knownFiles.has(file)) continue;

    const id = file === LEGACY_DB_NAME ? "legacy-default" : file.slice(0, -3);
    if (knownIds.has(id)) continue;

    const workspace: Workspace = {
      id,
      name: file === LEGACY_DB_NAME ? "Default" : "Recovered workspace",
      dbFileName: file,
      createdAt: createdAtFromWorkspaceId(id),
    };
    addWorkspace(workspace);
    knownIds.add(id);
    knownFiles.add(file);
  }
};
