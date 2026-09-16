import {
  getFolderDepth,
  getFolderIdsFromPath,
  getParentFolderPath,
} from "@repo/sqlite";
import { Folder, Note } from "@repo/zod-schemas";

import { NodeDatum } from "../types/types";
import { mapThoughtToLeaf, type ThoughtGraphRow } from "./mapThoughtToLeaf";
import { isNoteLeafId, mapNoteToLeaf } from "./mapNoteToLeaf";

/** Folder pack ids stay `folder-…` so UI helpers can detect them. */
export const folderNodeId = (folderId: string, scope?: string) =>
  scope ? `folder-${scope}-${folderId}` : `folder-${folderId}`;

type MutableFolderNode = NodeDatum & { children: NodeDatum[] };

export type BuildGraphByFolderOptions = {
  /**
   * Folders deeper than this collapse into the ancestor at this depth.
   * Thoughts in those nested folders attach to that ancestor.
   */
  maxFolderDepth?: number;
  /**
   * Scopes folder node ids (e.g. category id) so the same folder can appear under
   * multiple parents without colliding in graph navigation.
   */
  folderIdScope?: string;
  /** Optional thought ids per note for focus resolution on note leaves. */
  thoughtIdsByNoteId?: Map<string, string[]>;
  /**
   * When false, empty folders are dropped from the tree.
   * Defaults to true (folder mode keeps empty packs for navigation).
   */
  keepEmptyFolders?: boolean;
};

const isContentLeaf = (node: NodeDatum) =>
  !!node.thoughtId || isNoteLeafId(node.id);

/** Real folder pack (not the synthetic "unfiled" bucket). */
export const isRealFolderNode = (node: NodeDatum) =>
  !!node.folderId && node.folderId !== "unfiled";

/** True when a graph node is an empty folder pack. */
export const isEmptyFolderNode = (node: NodeDatum) =>
  !!node.isEmptyFolder ||
  (isRealFolderNode(node) &&
    !(node.children && node.children.length > 0) &&
    !isContentLeaf(node));

/** Shared folder nesting + leaf attach + prune. */
function buildFolderHierarchy(
  folders: Folder[],
  leaves: NodeDatum[],
  options?: BuildGraphByFolderOptions
): NodeDatum {
  const maxFolderDepth = options?.maxFolderDepth;
  const folderIdScope = options?.folderIdScope;
  const keepEmptyFolders = options?.keepEmptyFolders !== false;

  const foldersById = new Map(folders.map((folder) => [folder.id, folder]));
  const folderNodes = new Map<string, MutableFolderNode>();

  const foldersToShow =
    maxFolderDepth != null
      ? folders.filter(
          (folder) => getFolderDepth(folder.path) <= maxFolderDepth
        )
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

  for (const folder of foldersToShow) {
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

  const resolveAttachFolderId = (folderId: string): string | undefined => {
    if (folderNodes.has(folderId)) return folderId;
    if (maxFolderDepth == null) return undefined;

    const folder = foldersById.get(folderId);
    if (!folder) return undefined;
    const ids = getFolderIdsFromPath(folder.path);
    const deepestShown = Math.min(ids.length, maxFolderDepth) - 1;
    for (let i = deepestShown; i >= 0; i--) {
      if (folderNodes.has(ids[i])) return ids[i];
    }
    return undefined;
  };

  const unfiled: NodeDatum[] = [];

  for (const leaf of leaves) {
    const attachId = leaf.folderId
      ? resolveAttachFolderId(leaf.folderId)
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

  /**
   * Drop empty packs. Empty folders are kept only when `keepEmptyFolders`
   * (folder mode) so they stay navigable; category mode drops them.
   */
  const pruneEmpty = (node: NodeDatum): NodeDatum | null => {
    if (isContentLeaf(node)) return node;
    const kids = (node.children ?? [])
      .map(pruneEmpty)
      .filter((child): child is NodeDatum => child != null);
    if (!kids.length) {
      if (!keepEmptyFolders || !isRealFolderNode(node)) return null;
      // Leaf-sized pack so d3 can lay it out; flag for muted styling / nav.
      return {
        ...node,
        children: undefined,
        value: node.value ?? 1,
        isEmptyFolder: true,
      };
    }
    return { ...node, children: kids, isEmptyFolder: false };
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

/** Folder mode: folder tree → note leaves (deduped by note id). */
export function buildGraphByFolder(
  folders: Folder[],
  notes: Note[],
  options?: BuildGraphByFolderOptions
): NodeDatum {
  const thoughtIdsByNoteId = options?.thoughtIdsByNoteId;
  const uniqueNotes = new Map<string, Note>();
  for (const note of notes) {
    if (!note.id || uniqueNotes.has(note.id)) continue;
    uniqueNotes.set(note.id, note);
  }
  return buildFolderHierarchy(
    folders,
    Array.from(uniqueNotes.values()).map((note) =>
      mapNoteToLeaf(note, thoughtIdsByNoteId?.get(note.id))
    ),
    options
  );
}

/** Category mode helper: folder tree → thought leaves. */
export function buildGraphByFolderWithThoughts(
  folders: Folder[],
  thoughts: ThoughtGraphRow[],
  options?: BuildGraphByFolderOptions
): NodeDatum {
  return buildFolderHierarchy(folders, thoughts.map(mapThoughtToLeaf), options);
}
