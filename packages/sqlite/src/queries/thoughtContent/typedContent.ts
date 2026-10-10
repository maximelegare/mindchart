import { eq, inArray, sql } from "drizzle-orm";
import {
  Thought,
  getThoughtPlainText,
  isTextLikeThought,
} from "@repo/zod-schemas";
import {
  CheckboxContentTable,
  ContentTable,
  ListItemContentTable,
  TextContentTable,
} from "../../schema.root";
import { generateID } from "../../utils/generareID";
import type { DB } from "../../utils/initialize/getOPDatabase";

export const newContentId = () => generateID();

export const insertTypedContent = async (tx: DB, thought: Thought) => {
  await tx.insert(ContentTable).values({
    id: thought.contentId,
    type: thought.type,
  });
  await insertTypeRow(tx, thought);
};

const insertTypeRow = async (tx: DB, thought: Thought) => {
  if (isTextLikeThought(thought)) {
    await tx.insert(TextContentTable).values({
      id: thought.contentId,
      text: thought.content.text,
      style: thought.content.style === "inline" ? "inline" : "block",
    });
    return;
  }
  if (thought.type === "li") {
    await tx.insert(ListItemContentTable).values({
      id: thought.contentId,
      text: thought.content.text,
    });
    return;
  }
  await tx.insert(CheckboxContentTable).values({
    id: thought.contentId,
    text: thought.content.text,
    checked: thought.content.checked,
  });
};

const deleteTypeRows = async (tx: DB, contentId: string) => {
  await tx.delete(TextContentTable).where(eq(TextContentTable.id, contentId));
  await tx
    .delete(ListItemContentTable)
    .where(eq(ListItemContentTable.id, contentId));
  await tx
    .delete(CheckboxContentTable)
    .where(eq(CheckboxContentTable.id, contentId));
};

export const saveTypedContent = async (tx: DB, thought: Thought) => {
  await tx
    .update(ContentTable)
    .set({ type: thought.type })
    .where(eq(ContentTable.id, thought.contentId));
  await deleteTypeRows(tx, thought.contentId);
  await insertTypeRow(tx, thought);
};

export const deleteContentByIds = async (tx: DB, contentIds: string[]) => {
  const ids = Array.from(new Set(contentIds.filter(Boolean)));
  if (ids.length === 0) return;
  await tx.delete(ContentTable).where(inArray(ContentTable.id, ids));
};

export const insertThoughtFts = async (tx: DB, thought: Thought) => {
  const body = getThoughtPlainText(thought);
  await tx.run(sql`
    INSERT INTO thought_fts (id, title, body, semantic_label)
    VALUES (${thought.id}, ${thought.title ?? ""}, ${body}, ${thought.semanticLabel ?? ""})
  `);
};

export const updateThoughtFts = async (tx: DB, thought: Thought) => {
  const body = getThoughtPlainText(thought);
  await tx.run(sql`
    UPDATE thought_fts
    SET title = ${thought.title ?? ""},
        body = ${body},
        semantic_label = ${thought.semanticLabel ?? ""}
    WHERE id = ${thought.id}
  `);
};

export const deleteThoughtFts = async (tx: DB, ids: string[]) => {
  const validIds = Array.from(new Set(ids.filter(Boolean)));
  if (validIds.length === 0) return;
  await tx.run(sql`
    DELETE FROM thought_fts
    WHERE id IN (${sql.join(
      validIds.map((id) => sql`${id}`),
      sql`, `
    )})
  `);
};

export const deleteOrphanedContent = async (tx: DB) => {
  await tx.run(sql`
    DELETE FROM content
    WHERE id NOT IN (SELECT content_id FROM thought)
  `);
};
