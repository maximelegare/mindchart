import { sql } from "drizzle-orm";
import {
  CheckboxContentTable,
  ListItemContentTable,
  TextContentTable,
  ThoughtTable,
} from "../../schema.root";

/** JSON blob consumed by `assembleThought` after `json_group_array`. */
export const thoughtJsonObjectSql = sql`
  json_object(
    'id', ${ThoughtTable.id},
    'thoughtId', ${ThoughtTable.id},
    'title', ${ThoughtTable.title},
    'semanticLabel', ${ThoughtTable.semanticLabel},
    'createdAt', ${ThoughtTable.createdAt},
    'categoryId', ${ThoughtTable.categoryId},
    'noteId', ${ThoughtTable.noteId},
    'type', ${ThoughtTable.type},
    'contentId', ${ThoughtTable.contentId},
    'contentText', COALESCE(
      ${TextContentTable.text},
      ${ListItemContentTable.text},
      ${CheckboxContentTable.text},
      ''
    ),
    'checked', ${CheckboxContentTable.checked}
  )
`;
