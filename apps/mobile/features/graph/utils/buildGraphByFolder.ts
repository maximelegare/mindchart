import {
  getFolderDepth,
  getFolderIdsFromPath,
  getParentFolderPath,
} from "@repo/sqlite";
import { Folder } from "@repo/zod-schemas/src/schemas";
import { ThoughtWithEmbedding } from "@repo/zod-schemas/client";
import { NodeDatum } from "../types/types";
import { mapThoughtToLeaf } from "./mapThoughtToLeaf";

/** Folder pack ids stay `folder-…` so UI helpers can detect them. */
export const folderNodeId = (folderId: string, scope?: string) =>
  scope ? `folder-${scope}-${folderId}` : `folder-${folderId}`;

type MutableFolderNode = NodeDatum & { children: NodeDatum[] };

export type BuildGraphByFolderOptions = {
  /** When 1, only root folders appear; nested thoughts attach to their root ancestor. */
  maxFolderDepth?: number;
  /**
   * Scopes folder node ids (e.g. category id) so the same folder can appear under
   * multiple parents without colliding in graph navigation.
   */
  folderIdScope?: string;
};

export function buildGraphByFolder(
  folders: Folder[],
  thoughts: ThoughtWithEmbedding[],
  options?: BuildGraphByFolderOptions
): NodeDatum {
  const maxFolderDepth = options?.maxFolderDepth;
  const flattenToRootFolders = maxFolderDepth === 1;
  const folderIdScope = options?.folderIdScope;

  const foldersById = new Map(folders.map((folder) => [folder.id, folder]));
  const folderNodes = new Map<string, MutableFolderNode>();

  const foldersToShow = flattenToRootFolders
    ? folders.filter((folder) => getFolderDepth(folder.path) === 1)
    : folders;

  for (const folder of foldersToShow) {
    folderNodes.set(folder.id, {
      id: folderNodeId(folder.id, folderIdScope),
      name: folder.label || "Untitled",
      folderId: folder.id,
      folderPath: folder.path,
      folderLabel: folder.label,
      children: [],
    });
  }

  const rootChildren: NodeDatum[] = [];

  if (flattenToRootFolders) {
    for (const node of folderNodes.values()) {
      rootChildren.push(node);
    }
  } else {
    for (const folder of folders) {
      const node = folderNodes.get(folder.id)!;
      const parentPath = getParentFolderPath(folder.path);
      if (!parentPath) {
        rootChildren.push(node);
        continue;
      }
      const parentId = parentPath.split("/").filter(Boolean).pop();
      const parent = parentId ? folderNodes.get(parentId) : undefined;
      if (parent) {
        parent.children.push(node);
      } else {
        rootChildren.push(node);
      }
    }
  }

  const resolveAttachFolderId = (folderId: string): string | undefined => {
    if (folderNodes.has(folderId)) return folderId;
    if (!flattenToRootFolders) return undefined;

    const folder = foldersById.get(folderId);
    if (!folder) return undefined;
    const rootId = getFolderIdsFromPath(folder.path)[0];
    return rootId && folderNodes.has(rootId) ? rootId : undefined;
  };

  const unfiled: NodeDatum[] = [];

  for (const thought of thoughts) {
    const leaf = mapThoughtToLeaf(thought);
    const attachId = thought.folderId
      ? resolveAttachFolderId(thought.folderId)
      : undefined;
    if (attachId) {
      folderNodes.get(attachId)!.children.push(leaf);
    } else {
      unfiled.push(leaf);
    }
  }

  if (unfiled.length > 0) {
    rootChildren.push({
      id: folderNodeId("unfiled", folderIdScope),
      name: "No folder",
      folderId: "unfiled",
      children: unfiled,
    });
  }

  // Drop empty folder branches (no thoughts in subtree).
  const pruneEmpty = (node: NodeDatum): NodeDatum | null => {
    if (node.thoughtId) return node;
    const kids = (node.children ?? [])
      .map(pruneEmpty)
      .filter((child): child is NodeDatum => child != null);
    if (!kids.length) return null;
    return { ...node, children: kids };
  };

  const children = rootChildren
    .map(pruneEmpty)
    .filter((child): child is NodeDatum => child != null);

  return {
    id: "root",
    name: "root",
    children,
  };
}
