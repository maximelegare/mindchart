import z from "zod";
import { NoteSchema } from "@repo/zod-schemas";
import { Note } from "@repo/zod-schemas";

type NoteQueryRow = {
  id: string;
  title: string | null;
  summary: string | null;
  rawText: string | null;
  folder_id?: string | null;
  folder_label?: string | null;
  createdAt: string;
  updatedAt?: string | null;
  lastViewedAt?: string | null;
};

export const normalizeNotesFromQuery = (data: unknown): Note[] | null => {
  if (!data || !Array.isArray(data)) return null;

  const normalized = (data as NoteQueryRow[]).map((row) => ({
    id: row.id,
    title: row.title ?? "",
    summary: row.summary ?? "",
    rawText: row.rawText ?? "",
    folderId: row.folder_id ?? undefined,
    folderLabel: row.folder_label ?? undefined,
    createdAt: row.createdAt ?? undefined,
    updatedAt: row.updatedAt ?? undefined,
    lastViewedAt: row.lastViewedAt ?? null,
  }));

  const result = z.array(NoteSchema).safeParse(normalized);
  if (result.success) return result.data;

  // Soft fallback: keep rows that at least have an id (don't blank the graph).
  const soft = normalized.filter((row) => typeof row.id === "string" && row.id);
  return soft.length ? (soft as Note[]) : null;
};
