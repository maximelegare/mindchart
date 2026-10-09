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
    'nlpSourceHash', ${ThoughtTable.nlpSourceHash},
    'titleSource', ${ThoughtTable.titleSource},
    'categorySource', ${ThoughtTable.categorySource},
    'nlpStructureLocked', ${ThoughtTable.nlpStructureLocked},
    'nlpStructureSourceHash', ${ThoughtTable.nlpStructureSourceHash},
    'nlpStructureAnchor', hex(${ThoughtTable.nlpStructureAnchor}),
    'createdAt', ${ThoughtTable.createdAt},
    'categoryId', ${ThoughtTable.categoryId},
    'noteId', ${ThoughtTable.noteId},
    'type', ${ThoughtTable.type},
    'contentId', ${ThoughtTable.contentId},
    'position', ${ThoughtTable.position},
    'contentStyle', COALESCE(${TextContentTable.style}, 'block'),
    'contentText', COALESCE(
      ${TextContentTable.text},
      ${ListItemContentTable.text},
      ${CheckboxContentTable.text},
      ''
    ),
    'checked', ${CheckboxContentTable.checked}
  )
`;

export const thoughtsJsonGroupArraySql = sql<string>`
  json_group_array(
    ${thoughtJsonObjectSql}
    ORDER BY ${ThoughtTable.position} ASC, ${ThoughtTable.id} ASC
  ) FILTER (WHERE ${ThoughtTable.id} IS NOT NULL)
`;
