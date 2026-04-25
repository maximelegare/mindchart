import {
  getOPDatabase,
  getPendingEmbeddingsQuery,
  insertEmbeddingsQuery,
} from "@repo/sqlite";
import { insertPendingEmbeddingsQuery } from "@repo/sqlite";
import { Thought, PendingEmbeddingSchema } from "@repo/zod-schemas/client";
import { ClientOpenAIRoutes } from "@repo/constants";
import { z } from "zod";
import { Embedding } from "@repo/zod-schemas/src/schemas";
import { updateEmbeddingsQuery } from "@repo/sqlite";

export const fetchPendingEmbeddings = async () => {
  const db = getOPDatabase();
  return await getPendingEmbeddingsQuery(db);
};

export const insertPendingEmbeddings = async (data: Array<Thought>) => {
  const db = getOPDatabase();
  return await insertPendingEmbeddingsQuery(db, data);
};

type PendingEmbedding = z.infer<typeof PendingEmbeddingSchema>;

export const generateEmbeddings = async (body: Array<PendingEmbedding>) => {
  const response = await fetch(
    process.env.EXPO_PUBLIC_SERVER_HOST + ClientOpenAIRoutes.generateEmbeddings,
    {
      body: JSON.stringify(body),
      method: "post",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return await response.json();
};

export const insertEmbeddings = async (data: Embedding[]) => {
  const db = getOPDatabase();
  return await insertEmbeddingsQuery(db, data);
};

export const updateEmbeddings = async (data: Embedding[]) => {
  const db = getOPDatabase();
  return await updateEmbeddingsQuery(db, data);
};
