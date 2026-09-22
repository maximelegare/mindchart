import { eq, sql } from "drizzle-orm";
import { assembleThought } from "@repo/zod-schemas";
import {
  CategoryTable,
  CheckboxContentTable,
  ListItemContentTable,
  TextContentTable,
  ThoughtTable,
} from "../../schema.root";
import { type DB } from "../../utils/initialize/getOPDatabase";

export const getAllThoughtsGroupByCategoryQuery = async (db: DB) => {
  try {
    const rows = await db
      .select({
        category_id: CategoryTable.id,
        category_name: CategoryTable.name,
        category_color: CategoryTable.color,
        category_created_at: CategoryTable.createdAt,
        thought_id: ThoughtTable.id,
        thought_title: ThoughtTable.title,
        thought_semantic_label: ThoughtTable.semanticLabel,
        thought_created_at: ThoughtTable.createdAt,
        thought_note_id: ThoughtTable.noteId,
        thought_category_id: ThoughtTable.categoryId,
        thought_type: ThoughtTable.type,
        thought_content_id: ThoughtTable.contentId,
        content_text: sql<string>`COALESCE(
          ${TextContentTable.text},
          ${ListItemContentTable.text},
          ${CheckboxContentTable.text},
          ''
        )`,
        checked: CheckboxContentTable.checked,
      })
      .from(ThoughtTable)
      .innerJoin(CategoryTable, eq(ThoughtTable.categoryId, CategoryTable.id))
      .leftJoin(
        TextContentTable,
        eq(TextContentTable.id, ThoughtTable.contentId)
      )
      .leftJoin(
        ListItemContentTable,
        eq(ListItemContentTable.id, ThoughtTable.contentId)
      )
      .leftJoin(
        CheckboxContentTable,
        eq(CheckboxContentTable.id, ThoughtTable.contentId)
      );

    const categoriesById = new Map<
      string,
      {
        category_id: string;
        category_name: string;
        category_color: string;
        category_created_at: string;
        thoughts: ReturnType<typeof assembleThought>[];
      }
    >();

    for (const row of rows) {
      if (!row.thought_id) continue;

      const thought = assembleThought({
        id: row.thought_id,
        thoughtId: row.thought_id,
        title: row.thought_title,
        semanticLabel: row.thought_semantic_label,
        createdAt: row.thought_created_at,
        categoryId: row.thought_category_id,
        noteId: row.thought_note_id,
        type: row.thought_type,
        contentId: row.thought_content_id,
        contentText: row.content_text,
        checked: row.checked,
      });

      const existing = categoriesById.get(row.category_id);
      if (existing) {
        existing.thoughts.push(thought);
      } else {
        categoriesById.set(row.category_id, {
          category_id: row.category_id,
          category_name: row.category_name,
          category_color: row.category_color,
          category_created_at: row.category_created_at,
          thoughts: [thought],
        });
      }
    }

    return Array.from(categoriesById.values()).map((category) => ({
      category_id: category.category_id,
      category_name: category.category_name,
      category_color: category.category_color,
      category_created_at: category.category_created_at,
      thoughts_json: JSON.stringify(category.thoughts),
    }));
  } catch (error) {
    console.error(error);
  }
};
