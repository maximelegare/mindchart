import { Note, ThoughtWithEmbedding, assembleThought } from "@repo/zod-schemas";

import { NodeDatum, GraphDataCache } from "../types/types";
import { buildGraphByFolder } from "./buildGraphByFolder";
import { categoryGraphNeedsRebuild } from "./buildGraphByCategoryFolders";
import { isNoteLeafId } from "./mapNoteToLeaf";
import { stripHtml } from "@/components/ui/thoughtsEditor";
import { getThoughtPlainText } from "@repo/zod-schemas";

/** Bump when folder/category graph shape changes (forces DB cache rebuild). */
export const GRAPH_CACHE_VERSION = 10;

const isRootNode = (data: unknown): data is NodeDatum =>
  typeof data === "object" &&
  data !== null &&
  "id" in data &&
  (data as NodeDatum).id === "root";

export const isGraphDataCache = (data: unknown): data is GraphDataCache =>
  isRootNode((data as GraphDataCache)?.category) &&
  isRootNode((data as GraphDataCache)?.folder);

const walkTree = (
  root: NodeDatum,
  predicate: (node: NodeDatum) => boolean
): boolean => {
  if (predicate(root)) return true;
  return (root.children ?? []).some((child) => walkTree(child, predicate));
};

/** Folder mode should use note leaves; thought leaves mean a stale cache. */
const folderTreeHasThoughtLeaves = (root: NodeDatum) =>
  walkTree(root, (node) => !!node.thoughtId);

const folderTreeHasNoteLeaves = (root: NodeDatum) =>
  walkTree(
    root,
    (node) => isNoteLeafId(node.id) || (!!node.noteId && !node.thoughtId)
  );

const categoryTreeHasThoughtLeaves = (root: NodeDatum) =>
  walkTree(root, (node) => !!node.thoughtId);

/**
 * True when cache is wrong version, category packs need work, folder still
 * uses thoughts, or folder has no note leaves while category still has thoughts.
 */
export const needsFolderGraphRebuild = (data: unknown): boolean => {
  if (!isGraphDataCache(data)) return true;
  if (data.version !== GRAPH_CACHE_VERSION) return true;
  return (
    categoryGraphNeedsRebuild(data.category) ||
    folderTreeHasThoughtLeaves(data.folder) ||
    (categoryTreeHasThoughtLeaves(data.category) &&
      !folderTreeHasNoteLeaves(data.folder))
  );
};

/** Drop embeddings before persisting — Float32Array JSON is huge/useless. */
export const stripEmbeddingsFromCache = (
  cache: GraphDataCache
): GraphDataCache => {
  const strip = (node: NodeDatum): NodeDatum => {
    const { embedding: _embedding, ...rest } = node;
    return {
      ...rest,
      children: node.children?.map(strip),
    };
  };
  return {
    version: cache.version ?? GRAPH_CACHE_VERSION,
    category: strip(cache.category),
    folder: strip(cache.folder),
  };
};

export const extractThoughtLeaves = (
  root: NodeDatum
): ThoughtWithEmbedding[] => {
  const leaves: ThoughtWithEmbedding[] = [];

  const walk = (node: NodeDatum) => {
    if (!node.children?.length) {
      if (node.thoughtId) {
        leaves.push({
          ...assembleThought({
            thoughtId: node.thoughtId,
            id: node.thoughtId,
            title: node.title ?? "",
            contentText: node.summary ?? "",
            type: node.type ?? "li",
            checked: node.checked,
            noteId: node.noteId ?? "",
            categoryId: node.categoryId ?? "",
            folderId: node.folderId ?? null,
            folderLabel: node.folderLabel ?? null,
            folderPath: node.folderPath ?? null,
            createdAt: node.createdAt ?? null,
            semanticLabel: node.semanticLabel ?? "",
            contentId: "",
          }),
          embedding: node.embedding ?? null,
        });
      }
      return;
    }
    node.children.forEach(walk);
  };

  walk(root);
  return leaves;
};

/** Best-effort notes from thought leaves (legacy normalize only). */
const notesFromThoughtLeaves = (thoughts: ThoughtWithEmbedding[]): Note[] => {
  const byNote = new Map<string, Note>();
  for (const thought of thoughts) {
    if (!thought.noteId || byNote.has(thought.noteId)) continue;
    byNote.set(thought.noteId, {
      id: thought.noteId,
      title: stripHtml(thought.title) || "Untitled",
      summary: stripHtml(getThoughtPlainText(thought) || ""),
      rawText: "",
      folderId: thought.folderId ?? undefined,
      folderLabel: thought.folderLabel ?? undefined,
      createdAt: thought.createdAt ?? undefined,
    });
  }
  return Array.from(byNote.values());
};

export const normalizeGraphData = (data: unknown): GraphDataCache | null => {
  if (isGraphDataCache(data)) {
    return {
      version: data.version ?? GRAPH_CACHE_VERSION,
      category: data.category,
      folder: data.folder,
    };
  }

  if (isRootNode(data)) {
    const thoughts = extractThoughtLeaves(data);
    return {
      version: GRAPH_CACHE_VERSION,
      category: data,
      folder: buildGraphByFolder([], notesFromThoughtLeaves(thoughts)),
    };
  }

  return null;
};
