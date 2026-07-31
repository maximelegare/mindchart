import {
  getFolderDepth,
  getFolderIdsFromPath,
  getParentFolderPath,
} from "@repo/sqlite";
import { Folder } from "@repo/zod-schemas/src/schemas";
import { Note } from "@repo/zod-schemas";
import { ThoughtWithEmbedding } from "@repo/zod-schemas/client";
import { NodeDatum } from "../types/types";
import { mapThoughtToLeaf } from "./mapThoughtToLeaf";
import { isNoteLeafId, mapNoteToLeaf } from "./mapNoteToLeaf";

/** Folder pack ids stay `folder-…` so UI helpers can detect them. */
export const folderNodeId = (folderId: string, scope?: string) =>
  scope ? `folder-${scope}-${folderId}` : `folder-${folderId}`;

type MutableFolderNode = NodeDatum & { children: NodeDatum[] };

export type BuildGraphByFolderOptions = {
  /** When 1, only root folders appear; nested leaves attach to their root ancestor. */
  maxFolderDepth?: number;
  /**
   * Scopes folder node ids (e.g. category id) so the same folder can appear under
   * multiple parents without colliding in graph navigation.
   */
  folderIdScope?: string;
  /** Optional thought ids per note for focus resolution on note leaves. */
  thoughtIdsByNoteId?: Map<string, string[]>;
};

const isContentLeaf = (node: NodeDatum) =>
  !!node.thoughtId || isNoteLeafId(node.id);

/** Shared folder nesting + leaf attach + prune. */
function buildFolderHierarchy(
  folders: Folder[],
  leaves: NodeDatum[],
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

  const pruneEmpty = (node: NodeDatum): NodeDatum | null => {
    if (isContentLeaf(node)) return node;
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
  thoughts: ThoughtWithEmbedding[],
  options?: BuildGraphByFolderOptions
): NodeDatum {
  return buildFolderHierarchy(folders, thoughts.map(mapThoughtToLeaf), options);
}
