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

function extractByClass(html: string, className: string): string | null {
  const regex = new RegExp(
    `<div\\b[^>]*class=["'][^"']*\\b${className}\\b[^"']*["'][^>]*>([\\s\\S]*?)<\\/div>`,
    "i"
  );
  const match = html.match(regex);
  return match ? (match[1] ?? "") : null;
}

function parseTitledLi(liHtml: string): { title: string; summary: string } {
  const titled = extractByClass(liHtml, TITLE_CLASS);
  const summarized = extractByClass(liHtml, SUMMARY_CLASS);

  if (titled != null || summarized != null) {
    return {
      title: stripHtml(titled ?? ""),
      summary: stripHtml(summarized ?? ""),
    };
  }

  const blocks = liHtml
    .split(/<\/(?:div|p)>/i)
    .map((block) => stripHtml(block))
    .filter(Boolean);

  if (blocks.length === 0) {
    return { title: "", summary: "" };
  }

  if (blocks.length === 1) {
    return { title: blocks[0] ?? "", summary: "" };
  }

  return {
    title: blocks[0] ?? "",
    summary: blocks.slice(1).join("\n"),
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

function thoughtItemHtml(categoryId: string, fieldsHtml: string): string {
  const id = categoryId || "uncategorized";
  return (
    `<li class="thought-item" data-category-id="${escapeHtml(id)}">` +
    `<div class="thought-rail" contenteditable="false">` +
    `<div class="thought-stripe"></div>` +
    `</div>` +
    `<div class="thought-body">` +
    categoryLabelHtml(id) +
    `<div class="${FIELDS_CLASS}">${fieldsHtml}</div>` +
    `</div>` +
    `</li>`
  );
}

function liToHtml(thought: ThoughtsFormValue, showTitles: boolean): string {
  const categoryId = thought.categoryId || "uncategorized";

  if (showTitles) {
    const title = escapeHtml(thought.title);
    const summary = escapeHtml(thought.summary).replace(/\n/g, "<br>");
    return thoughtItemHtml(
      categoryId,
      titledFieldHtml(TITLE_CLASS, TITLE_PLACEHOLDER, title) +
        titledFieldHtml(SUMMARY_CLASS, SUMMARY_PLACEHOLDER, summary)
    );
  }

  const summaryText = thought.summary || thought.title;
  const summary = escapeHtml(summaryText).replace(/\n/g, "<br>");
  return thoughtItemHtml(
    categoryId,
    titledFieldHtml(SUMMARY_CLASS, BULLET_PLACEHOLDER, summary)
  );
}

/** Serialize thoughts into an HTML unordered list for the rich editor. */
export function thoughtsToHtml(
  thoughts: ThoughtsFormValue[],
  showTitles: boolean
): string {
  if (thoughts.length === 0) {
    const body = showTitles
      ? titledFieldHtml(TITLE_CLASS, TITLE_PLACEHOLDER, "") +
        titledFieldHtml(SUMMARY_CLASS, SUMMARY_PLACEHOLDER, "")
      : titledFieldHtml(SUMMARY_CLASS, BULLET_PLACEHOLDER, "");
    return `<ul>${thoughtItemHtml("uncategorized", body)}</ul>`;
  }

  return `<ul>${thoughts.map((thought) => liToHtml(thought, showTitles)).join("")}</ul>`;
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
      const { title, summary } = parseTitledLi(contentHtml);
      const label = title || summary || base.semanticLabel;
      return {
        ...base,
        title,
        summary,
        categoryId,
        semanticLabel: label,
      };
    }

    const summaryField = extractByClass(contentHtml, SUMMARY_CLASS);
    const summary = stripHtml(
      summaryField != null ? summaryField : contentHtml
    );
    return {
      ...base,
      summary,
      categoryId,
      semanticLabel: base.semanticLabel || summary || base.title,
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
