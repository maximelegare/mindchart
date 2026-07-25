import { NodeDatum, GraphDataCache } from "../types/types";
import { buildGraphByFolder } from "./buildGraphByFolder";
import { ThoughtWithEmbedding } from "@repo/zod-schemas/client";

const isRootNode = (data: unknown): data is NodeDatum =>
  typeof data === "object" &&
  data !== null &&
  "id" in data &&
  (data as NodeDatum).id === "root";

export const isGraphDataCache = (data: unknown): data is GraphDataCache =>
  isRootNode((data as GraphDataCache)?.category) &&
  isRootNode((data as GraphDataCache)?.folder);

const treeContainsTopicNodes = (root: NodeDatum): boolean => {
  if (root.id.startsWith("topic-")) return true;
  return (root.children ?? []).some(treeContainsTopicNodes);
};

/** True when cache is missing folder mode or still nests topic nodes. */
export const needsFolderGraphRebuild = (data: unknown): boolean => {
  if (!isGraphDataCache(data)) return true;
  return (
    treeContainsTopicNodes(data.category) || treeContainsTopicNodes(data.folder)
  );
};

const isLegacyTopicCache = (
  data: unknown
): data is { category: NodeDatum; topic: NodeDatum } =>
  isRootNode((data as { category?: NodeDatum })?.category) &&
  isRootNode((data as { topic?: NodeDatum })?.topic);

export const extractThoughtLeaves = (
  root: NodeDatum
): ThoughtWithEmbedding[] => {
  const leaves: ThoughtWithEmbedding[] = [];

  const walk = (node: NodeDatum) => {
    if (!node.children?.length) {
      if (node.thoughtId) {
        leaves.push({
          thoughtId: node.thoughtId,
          title: node.title ?? null,
          summary: node.summary ?? null,
          noteId: node.noteId ?? "",
          categoryId: node.categoryId ?? "",
          topicId: node.topicId ?? "",
          topicName: node.topicName ?? null,
          folderId: node.folderId ?? null,
          folderLabel: node.folderLabel ?? null,
          folderPath: node.folderPath ?? null,
          createdAt: node.createdAt ?? null,
          embedding: node.embedding ?? null,
        } as ThoughtWithEmbedding);
      }
      return;
    }
    node.children.forEach(walk);
  };

  walk(root);
  return leaves;
};

export const normalizeGraphData = (data: unknown): GraphDataCache | null => {
  if (isGraphDataCache(data)) {
    return data;
  }

  if (isLegacyTopicCache(data)) {
    const thoughts = extractThoughtLeaves(data.topic);
    return {
      category: data.category,
      folder: buildGraphByFolder([], thoughts),
    };
  }

  if (isRootNode(data)) {
    const thoughts = extractThoughtLeaves(data);
    return {
      category: data,
      folder: buildGraphByFolder([], thoughts),
    };
  }

  return null;
};
