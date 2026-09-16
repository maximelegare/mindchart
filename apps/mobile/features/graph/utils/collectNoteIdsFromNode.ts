import type { NodeDatum } from "../types/types";
import { isNoteLeafId } from "./mapNoteToLeaf";

const isFolderPack = (node: NodeDatum) =>
  !node.thoughtId &&
  !isNoteLeafId(node.id) &&
  (node.folderId != null ||
    node.id.startsWith("folder-") ||
    node.id.startsWith("category-") ||
    node.id === "root");

const nodeMatchesId = (node: NodeDatum, targetId: string) =>
  node.id === targetId ||
  node.thoughtId === targetId ||
  node.noteId === targetId ||
  node.folderId === targetId ||
  (node.noteId != null && targetId === `note-${node.noteId}`);

const findNodePathByLocation = (
  root: NodeDatum,
  targetId: string
): NodeDatum[] => {
  const path: NodeDatum[] = [];
  const walk = (node: NodeDatum, trail: NodeDatum[]): boolean => {
    const next = [...trail, node];
    if (nodeMatchesId(node, targetId)) {
      path.push(...next);
      return true;
    }
    for (const child of node.children ?? []) {
      if (walk(child, next)) return true;
    }
    return false;
  };
  walk(root, []);
  return path;
};

/** Folder/category pack for the current graph selection (not nested descendants). */
export const resolveDirectoryNode = (
  root: NodeDatum,
  targetId: string
): NodeDatum => {
  const path = findNodePathByLocation(root, targetId);
  if (path.length === 0) return root;
  const target = path[path.length - 1];
  if (isFolderPack(target)) return target;
  for (let i = path.length - 2; i >= 0; i--) {
    if (isFolderPack(path[i])) return path[i];
  }
  return target;
};

/** Notes that live in this directory — not in nested folders. */
export const collectNoteIdsFromNode = (node: NodeDatum): string[] => {
  const ids: string[] = [];
  const seen = new Set<string>();
  const add = (noteId?: string | null) => {
    if (!noteId || seen.has(noteId)) return;
    seen.add(noteId);
    ids.push(noteId);
  };

  if (!isFolderPack(node)) {
    add(node.noteId);
    return ids;
  }

  for (const child of node.children ?? []) {
    if (isFolderPack(child)) continue;
    add(child.noteId);
  }
  return ids;
};
