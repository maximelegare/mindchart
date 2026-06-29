import { NodeDatum, GraphDataCache } from "../types/types";
import { buildGraphByTopic } from "./buildGraphByTopic";
import { ThoughtWithEmbedding } from "@repo/zod-schemas/client";

const isRootNode = (data: unknown): data is NodeDatum =>
  typeof data === "object" &&
  data !== null &&
  "id" in data &&
  (data as NodeDatum).id === "root";

export const isGraphDataCache = (data: unknown): data is GraphDataCache =>
  isRootNode((data as GraphDataCache)?.category) &&
  isRootNode((data as GraphDataCache)?.topic);

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

  if (isRootNode(data)) {
    const thoughts = extractThoughtLeaves(data);
    return {
      category: data,
      topic: buildGraphByTopic(thoughts),
    };
  }

  return null;
};
