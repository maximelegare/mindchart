import { Thought } from "@repo/zod-schemas";
import { DB } from "../../utils/initialize/getOPDatabase";
import { CheckboxContentTable, ThoughtTable } from "../../schema.root";
import { eq, sql } from "drizzle-orm";
import {
  deleteContentByIds,
  insertThoughtFts,
  insertTypedContent,
  saveTypedContent,
  updateThoughtFts,
} from "../thoughtContent/typedContent";

const thoughtRow = (thought: Thought, position = 0) => ({
  id: thought.id,
  noteId: thought.noteId,
  type: thought.type,
  contentId: thought.contentId,
  title: thought.title,
  semanticLabel: thought.semanticLabel,
  categoryId: thought.categoryId,
  position: thought.position ?? position,
  createdAt: thought.createdAt ?? new Date().toISOString(),
});

export const updateThoughtsQuery = async (
  db: DB,
  data: Array<Thought & { status: "new" | "updated" }>
) => {
  const validData = Array.from(
    new Map(data.filter(Boolean).map((t) => [t.id, t])).values()
  );

  if (validData.length === 0) {
    return { inserted: 0, updated: 0 };
  }

  let inserted = 0;
  let updated = 0;

  try {
    const toInsert = validData.filter((t) => t.status === "new");
    const toUpdate = validData.filter((t) => t.status === "updated");

    for (const [index, thought] of toInsert.entries()) {
      await insertTypedContent(db, thought);
      await db.insert(ThoughtTable).values(thoughtRow(thought, index));
      await insertThoughtFts(db, thought);
      inserted += 1;
    }

    for (const [index, thought] of toUpdate.entries()) {
      const [existing] = await db
        .select({ contentId: ThoughtTable.contentId })
        .from(ThoughtTable)
        .where(eq(ThoughtTable.id, thought.id))
        .limit(1);

      if (!existing) {
        await insertTypedContent(db, thought);
        await db.insert(ThoughtTable).values(thoughtRow(thought, index));
        await insertThoughtFts(db, thought);
        inserted += 1;
        continue;
      }

      const previousContentId = existing.contentId;

      if (!previousContentId || previousContentId !== thought.contentId) {
        await insertTypedContent(db, thought);
      } else {
        await saveTypedContent(db, thought);
      }

      await db
        .update(ThoughtTable)
        .set({
          title: thought.title,
          semanticLabel: thought.semanticLabel,
          categoryId: thought.categoryId,
          type: thought.type,
          contentId: thought.contentId,
          position: thought.position ?? index,
        })
        .where(eq(ThoughtTable.id, thought.id));
      await updateThoughtFts(db, thought);

      if (previousContentId && previousContentId !== thought.contentId) {
        await deleteContentByIds(db, [previousContentId]);
      }
      updated += 1;
    }

    return {
      inserted,
      updated,
      total: inserted + updated,
    };
  } catch (error) {
    console.error("updateThoughtsQuery failed:", error);
    throw error;
  }
};

export const updateThoughtCompletionQuery = async (
  db: DB,
  data: { id: string; isCompleted: boolean }
) => {
  const [thought] = await db
    .select({ contentId: ThoughtTable.contentId, type: ThoughtTable.type })
    .from(ThoughtTable)
    .where(eq(ThoughtTable.id, data.id))
    .limit(1);
  if (!thought || thought.type !== "checkbox") return;
  await db
    .update(CheckboxContentTable)
    .set({ checked: data.isCompleted })
    .where(eq(CheckboxContentTable.id, thought.contentId));
};

export const updateThoughtCategoryQuery = async (
  db: DB,
  data: { id: string; categoryId: string }
) => {
  await db
    .update(ThoughtTable)
    .set({ categoryId: data.categoryId || "uncategorized" })
    .where(eq(ThoughtTable.id, data.id));
};

export const updateThoughtNlpQuery = async (
  db: DB,
  data: Array<{ id: string; semanticLabel?: string; categoryId?: string }>
) => {
  for (const row of data) {
    const patch: { semanticLabel?: string; categoryId?: string } = {};
    if (row.semanticLabel != null) patch.semanticLabel = row.semanticLabel;
    if (row.categoryId != null) patch.categoryId = row.categoryId;
    if (Object.keys(patch).length === 0) continue;

    await db.update(ThoughtTable).set(patch).where(eq(ThoughtTable.id, row.id));

    if (row.semanticLabel != null) {
      await db.run(sql`
        UPDATE thought_fts
        SET semantic_label = ${row.semanticLabel}
        WHERE id = ${row.id}
      `);
    }
  }
};
