import { createEmptyThought, type ThoughtsFormValue } from "./types";

const TITLE_CLASS = "thought-title";
const SUMMARY_CLASS = "thought-summary";
const CATEGORY_CLASS = "thought-category";
const FIELDS_CLASS = "thought-fields";

export const TITLE_PLACEHOLDER = "Title";
export const SUMMARY_PLACEHOLDER = "Summary";
export const BULLET_PLACEHOLDER = "Enter a bullet point";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function decodeHtml(value: string): string {
  return value
    .replace(/&nbsp;/gi, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&");
}

/** Strip tags and normalize whitespace for plain thought text. */
export function stripHtml(html: string): string {
  return decodeHtml(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/\u00a0/g, " ")
  )
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function formatCategoryLabel(categoryId: string): string {
  if (!categoryId) return "Uncategorized";
  return categoryId.charAt(0).toUpperCase() + categoryId.slice(1);
}

function stripChrome(liHtml: string): string {
  const fields = extractByClass(liHtml, FIELDS_CLASS);
  if (fields != null) return fields;

  return liHtml
    .replace(
      /<div\b[^>]*class=["'][^"']*\bthought-rail\b[^"']*["'][^>]*>[\s\S]*?<\/div>/i,
      ""
    )
    .replace(
      /<div\b[^>]*class=["'][^"']*\bthought-graph\b[^"']*["'][^>]*>[\s\S]*?<\/div>/i,
      ""
    )
    .replace(
      new RegExp(
        `<div\\b[^>]*class=["'][^"']*\\b${CATEGORY_CLASS}\\b[^"']*["'][^>]*>[\\s\\S]*?<\\/div>`,
        "i"
      ),
      ""
    )
    .replace(
      /<div\b[^>]*class=["'][^"']*\bthought-body\b[^"']*["'][^>]*>/i,
      ""
    );
}

type LiItem = {
  categoryId: string | null;
  innerHtml: string;
};

function extractLiItems(html: string): LiItem[] {
  const items: LiItem[] = [];
  const liRegex = /<li\b([^>]*)>([\s\S]*?)<\/li>/gi;
  let match: RegExpExecArray | null;
  while ((match = liRegex.exec(html)) !== null) {
    const attrs = match[1] ?? "";
    const categoryMatch = attrs.match(/data-category-id=["']([^"']+)["']/i);
    items.push({
      categoryId: categoryMatch?.[1] ?? null,
      innerHtml: match[2] ?? "",
    });
  }
  return items;
}

/**
 * Return the inner HTML of the first div with the given class, respecting nested divs.
 * A naive non-greedy `.*?<\/div>` stops at the first child closing tag and drops siblings
 * (e.g. thought-summary after thought-title inside thought-fields).
 */
function extractByClass(html: string, className: string): string | null {
  const openRegex = new RegExp(
    `<div\\b[^>]*class=["'][^"']*\\b${className}\\b[^"']*["'][^>]*>`,
    "i"
  );
  const openMatch = openRegex.exec(html);
  if (!openMatch || openMatch.index == null) return null;

  const contentStart = openMatch.index + openMatch[0].length;
  let depth = 1;
  const tagRegex = /<\/?div\b[^>]*>/gi;
  tagRegex.lastIndex = contentStart;

  let tag: RegExpExecArray | null;
  while ((tag = tagRegex.exec(html)) !== null) {
    const isClose = /^<\//.test(tag[0]);
    const isSelfClose = /\/>$/.test(tag[0]);
    if (isClose) {
      depth -= 1;
      if (depth === 0) {
        return html.slice(contentStart, tag.index);
      }
      continue;
    }
    if (!isSelfClose) {
      depth += 1;
    }
  }

  return null;
}

function parseTitledLi(liHtml: string): {
  title: string;
  summary: string;
  /** True when a `.thought-title` node exists (even if empty). */
  hasTitleField: boolean;
  /** True when a `.thought-summary` node exists (even if empty). */
  hasSummaryField: boolean;
} {
  const titled = extractByClass(liHtml, TITLE_CLASS);
  const summarized = extractByClass(liHtml, SUMMARY_CLASS);

  if (titled != null || summarized != null) {
    return {
      title: stripHtml(titled ?? ""),
      summary: stripHtml(summarized ?? ""),
      hasTitleField: titled != null,
      hasSummaryField: summarized != null,
    };
  }

  const blocks = liHtml
    .split(/<\/(?:div|p)>/i)
    .map((block) => stripHtml(block))
    .filter(Boolean);

  if (blocks.length === 0) {
    return {
      title: "",
      summary: "",
      hasTitleField: false,
      hasSummaryField: false,
    };
  }

  if (blocks.length === 1) {
    return {
      title: blocks[0] ?? "",
      summary: "",
      hasTitleField: false,
      hasSummaryField: false,
    };
  }

  return {
    title: blocks[0] ?? "",
    summary: blocks.slice(1).join("\n"),
    hasTitleField: false,
    hasSummaryField: false,
  };
}

function titledFieldHtml(
  className: string,
  placeholder: string,
  value: string
): string {
  const empty = !value;
  const body = value || "<br>";
  const classes = empty ? `${className} is-placeholder` : className;
  return `<div class="${classes}" data-placeholder="${placeholder}">${body}</div>`;
}

function categoryLabelHtml(categoryId: string): string {
  const id = categoryId || "uncategorized";
  const label = formatCategoryLabel(id);
  return (
    `<div class="${CATEGORY_CLASS}" contenteditable="false" data-category-id="${escapeHtml(id)}">` +
    `<span class="thought-category-name">${escapeHtml(label)}</span>` +
    `</div>`
  );
}

const GRAPH_ICON_SVG =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="18" height="18" fill="currentColor" aria-hidden="true">` +
  `<path d="M200 152a31.84 31.84 0 0 0-19.53 6.68l-23.11-18A31.65 31.65 0 0 0 160 128c0-.74 0-1.48-.08-2.21l13.23-4.41A32 32 0 1 0 168 104c0 .74 0 1.48.08 2.21l-13.23 4.41A32 32 0 0 0 128 96a32.6 32.6 0 0 0-5.27.44L115.89 81A32 32 0 1 0 96 88a32.6 32.6 0 0 0 5.27-.44l6.84 15.4a31.92 31.92 0 0 0-8.57 39.64l-25.71 22.84a32.06 32.06 0 1 0 10.63 12l25.71-22.84a31.91 31.91 0 0 0 37.36-1.24l23.11 18A31.65 31.65 0 0 0 168 184a32 32 0 1 0 32-32m0-64a16 16 0 1 1-16 16a16 16 0 0 1 16-16M80 56a16 16 0 1 1 16 16a16 16 0 0 1-16-16M56 208a16 16 0 1 1 16-16a16 16 0 0 1-16 16m56-80a16 16 0 1 1 16 16a16 16 0 0 1-16-16m88 72a16 16 0 1 1 16-16a16 16 0 0 1-16 16"></path>` +
  `</svg>`;

function graphButtonHtml(thoughtId: string): string {
  return (
    `<div class="thought-graph" contenteditable="false" data-thought-id="${escapeHtml(thoughtId)}">` +
    GRAPH_ICON_SVG +
    `</div>`
  );
}

type ThoughtItemOptions = {
  thoughtId?: string;
  showGraphButton?: boolean;
};

function thoughtItemHtml(
  categoryId: string,
  fieldsHtml: string,
  options: ThoughtItemOptions = {}
): string {
  const id = categoryId || "uncategorized";
  const thoughtIdAttr = options.thoughtId
    ? ` data-thought-id="${escapeHtml(options.thoughtId)}"`
    : "";
  const graph =
    options.showGraphButton && options.thoughtId
      ? graphButtonHtml(options.thoughtId)
      : "";
  return (
    `<li class="thought-item" data-category-id="${escapeHtml(id)}"${thoughtIdAttr}>` +
    `<div class="thought-rail" contenteditable="false">` +
    `<div class="thought-stripe"></div>` +
    `</div>` +
    `<div class="thought-body">` +
    categoryLabelHtml(id) +
    `<div class="${FIELDS_CLASS}">${fieldsHtml}</div>` +
    `</div>` +
    graph +
    `</li>`
  );
}

function liToHtml(
  thought: ThoughtsFormValue,
  showTitles: boolean,
  showGraphButton: boolean
): string {
  const categoryId = thought.categoryId || "uncategorized";
  const options: ThoughtItemOptions = {
    thoughtId: thought.thoughtId || thought.id,
    showGraphButton,
  };

  if (showTitles) {
    const title = escapeHtml(thought.title);
    const summary = escapeHtml(thought.summary).replace(/\n/g, "<br>");
    return thoughtItemHtml(
      categoryId,
      titledFieldHtml(TITLE_CLASS, TITLE_PLACEHOLDER, title) +
        titledFieldHtml(SUMMARY_CLASS, SUMMARY_PLACEHOLDER, summary),
      options
    );
  }

  const summaryText = thought.summary || thought.title;
  const summary = escapeHtml(summaryText).replace(/\n/g, "<br>");
  return thoughtItemHtml(
    categoryId,
    titledFieldHtml(SUMMARY_CLASS, BULLET_PLACEHOLDER, summary),
    options
  );
}

export type ThoughtsToHtmlOptions = {
  showGraphButtons?: boolean;
};

/** Serialize thoughts into an HTML unordered list for the rich editor. */
export function thoughtsToHtml(
  thoughts: ThoughtsFormValue[],
  showTitles: boolean,
  options: ThoughtsToHtmlOptions = {}
): string {
  const showGraphButtons = options.showGraphButtons ?? false;

  if (thoughts.length === 0) {
    const body = showTitles
      ? titledFieldHtml(TITLE_CLASS, TITLE_PLACEHOLDER, "") +
        titledFieldHtml(SUMMARY_CLASS, SUMMARY_PLACEHOLDER, "")
      : titledFieldHtml(SUMMARY_CLASS, BULLET_PLACEHOLDER, "");
    return `<ul>${thoughtItemHtml("uncategorized", body)}</ul>`;
  }

  return `<ul>${thoughts
    .map((thought) => liToHtml(thought, showTitles, showGraphButtons))
    .join("")}</ul>`;
}

/**
 * Parse rich-editor HTML back into thoughts, preserving metadata from
 * previous thoughts at the same index when possible.
 */
export function htmlToThoughts(
  html: string,
  noteId: string,
  previous: ThoughtsFormValue[],
  showTitles: boolean
): ThoughtsFormValue[] {
  const liItems = extractLiItems(html);

  if (liItems.length === 0) {
    const plain = stripHtml(html);
    if (!plain) {
      return previous.length > 0 ? previous : [createEmptyThought(noteId)];
    }

    const base = previous[0] ?? createEmptyThought(noteId);
    return [
      {
        ...base,
        summary: showTitles ? base.summary : plain,
        title: showTitles ? plain : base.title,
        semanticLabel: base.semanticLabel || plain,
      },
    ];
  }

  const next = liItems.map((item, index) => {
    const base = previous[index] ?? createEmptyThought(noteId);
    const contentHtml = stripChrome(item.innerHtml);
    const categoryId = item.categoryId || base.categoryId || "uncategorized";

    if (showTitles) {
      const { title, summary, hasTitleField, hasSummaryField } =
        parseTitledLi(contentHtml);
      // Only fall back to previous values when the field node is missing from
      // the HTML (e.g. mid-init). Present-but-empty fields must clear so
      // validation can re-run after the user dismisses error placeholders.
      const nextTitle = hasTitleField ? title : title || base.title;
      const nextSummary = hasSummaryField ? summary : summary || base.summary;
      const fieldsPresent = hasTitleField || hasSummaryField;
      const label = nextTitle || nextSummary;
      return {
        ...base,
        title: nextTitle,
        summary: nextSummary,
        categoryId,
        semanticLabel: fieldsPresent ? label : label || base.semanticLabel,
      };
    }

    const summaryField = extractByClass(contentHtml, SUMMARY_CLASS);
    const summary = stripHtml(
      summaryField != null ? summaryField : contentHtml
    );
    // Present-but-empty `.thought-summary` must clear, not keep stale text.
    const nextSummary =
      summaryField != null ? summary : summary || base.summary;
    return {
      ...base,
      summary: nextSummary,
      categoryId,
      semanticLabel:
        summaryField != null
          ? nextSummary
          : base.semanticLabel || nextSummary || base.title,
    };
  });

  const trimmed = next.filter(
    (thought, index) =>
      index === 0 ||
      thought.title.trim().length > 0 ||
      thought.summary.trim().length > 0
  );

  return trimmed.length > 0 ? trimmed : [createEmptyThought(noteId)];
}

/** Build a JS snippet that updates one thought's category chrome in the editor. */
export function setThoughtCategoryScript(
  index: number,
  categoryId: string
): string {
  const id = JSON.stringify(categoryId || "uncategorized");
  const label = JSON.stringify(
    formatCategoryLabel(categoryId || "uncategorized")
  );
  return `
(function () {
  var content =
    document.querySelector(".pell-content") || document.getElementById("editor");
  if (!content) return true;
  var lis = content.querySelectorAll("ul > li");
  var li = lis[${index}];
  if (!li) return true;
  var categoryId = ${id};
  var label = ${label};
  li.setAttribute("data-category-id", categoryId);
  var chip = li.querySelector(".thought-category");
  if (chip) {
    chip.setAttribute("data-category-id", categoryId);
    var name = chip.querySelector(".thought-category-name");
    if (name) name.textContent = label;
  }
  if (typeof window.__mcExpandThoughtCategory === "function") {
    window.__mcExpandThoughtCategory(li);
  }
  try {
    content.dispatchEvent(new Event("input", { bubbles: true }));
  } catch (e) {}
  return true;
})();
`;
}
