import { ThoughtWithEmbedding } from "@repo/zod-schemas/client";
import { NodeDatum } from "../types/types";

export const mapThoughtToLeaf = (t: ThoughtWithEmbedding): NodeDatum => ({
  id: t.thoughtId,
  name: t.title || "Untitled",
  value: 1,
  thoughtId: t.thoughtId,
  title: t.title,
  summary: t.summary,
  noteId: t.noteId,
  categoryId: t.categoryId,
  topicId: t.topicId,
  topicName: t.topicName,
  createdAt: t.createdAt,
  embedding: t.embedding,
});
