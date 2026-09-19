import { isDisplayableSemanticLabel } from "@/lib/nlp/labelQuality";
import { createEmptyThought, type ThoughtsFormValue } from "./types";
import type { ThoughtFieldPlaceholders } from "./thoughtsEditorLabels";

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

const isFallbackSemanticLabel = (
  label: string,
  title: string,
  summary: string
) => {
  const value = stripHtml(label).toLowerCase();
  if (!value) return true;
  const previousTitle = stripHtml(title).toLowerCase();
  const previousSummary = stripHtml(summary).toLowerCase();
  return value === previousTitle || value === previousSummary;
};

const preservedSemanticLabel = (
  previous: ThoughtsFormValue,
  nextTitle: string,
  nextSummary: string
) => {
  if (!stripHtml(nextTitle) && !stripHtml(nextSummary)) return "";
  if (
    isFallbackSemanticLabel(
      previous.semanticLabel,
      previous.title,
      previous.summary
    )
  ) {
    return nextTitle || nextSummary;
  }
  return previous.semanticLabel;
};

/** Keep only inline bold/italic/underline markup for editor round-trips. */
export function sanitizeInlineHtml(html: string): string {
  if (!html) return "";

  let value = html
    .replace(/&nbsp;/gi, " ")
    .replace(/<div\b[^>]*>/gi, "")
    .replace(/<\/div>/gi, "<br>")
    .replace(/<p\b[^>]*>/gi, "")
    .replace(/<\/p>/gi, "<br>")
    .replace(/<span\b[^>]*>/gi, "")
    .replace(/<\/span>/gi, "")
    .replace(/<strong\b[^>]*>/gi, "<b>")
    .replace(/<\/strong>/gi, "</b>")
    .replace(/<em\b[^>]*>/gi, "<i>")
    .replace(/<\/em>/gi, "</i>");

  value = value.replace(/<\/?([a-z0-9]+)(\s[^>]*)?\/?>/gi, (match, tag) => {
    const name = String(tag).toLowerCase();
    if (name === "br") return "<br>";
    if (name === "b" || name === "i" || name === "u") {
      return match.startsWith("</") ? `</${name}>` : `<${name}>`;
    }
    return "";
  });

  return value.replace(/^(<br>)+|(<br>)+$/gi, "").trim();
}

function formatCategoryLabel(
  categoryId: string,
  labels?: Record<string, string>
): string {
  const id = categoryId || "uncategorized";
  const translated = labels?.[id];
  if (translated) return translated;
  return id.charAt(0).toUpperCase() + id.slice(1);
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
      /<button\b[^>]*class=["'][^"']*\bthought-check\b[^"']*["'][^>]*>[\s\S]*?<\/button>/i,
      ""
    )
    .replace(
      /<div\b[^>]*class=["'][^"']*\bthought-graph\b[^"']*["'][^>]*>[\s\S]*?<\/div>/i,
      ""
    )
    .replace(
      /<button\b[^>]*class=["'][^"']*\bthought-expand\b[^"']*["'][^>]*>[\s\S]*?<\/button>/i,
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
  isCompletable: boolean | null;
  isCompleted: boolean | null;
};

function parseDataBool(attrs: string, name: string): boolean | null {
  const match = attrs.match(new RegExp(`data-${name}=["']([^"']*)["']`, "i"));
  if (!match) return null;
  const value = (match[1] ?? "").toLowerCase();
  return value === "true" || value === "1";
}

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
      isCompletable: parseDataBool(attrs, "completable"),
      isCompleted: parseDataBool(attrs, "completed"),
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

/** Keep an unchanged generated heading out of `title` so a typed title still wins later. */
function resolveEditableTitle(
  previous: ThoughtsFormValue,
  parsedTitle: string
): { title: string; clearSemantic: boolean } {
  const parsed = stripHtml(parsedTitle);
  const generated = compactSemanticLabel(previous);
  if (stripHtml(previous.title) || !generated) {
    return { title: parsedTitle, clearSemantic: false };
  }
  if (!parsed) return { title: "", clearSemantic: true };
  if (parsed.toLowerCase() === stripHtml(generated).toLowerCase()) {
    return { title: previous.title, clearSemantic: false };
  }
  return { title: parsedTitle, clearSemantic: false };
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
      title: sanitizeInlineHtml(titled ?? ""),
      summary: sanitizeInlineHtml(summarized ?? ""),
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
  const withBreaks = value.replace(/\n/g, "<br>");
  const body = /<[a-z]/i.test(withBreaks)
    ? sanitizeInlineHtml(withBreaks)
    : escapeHtml(withBreaks);
  const empty = !stripHtml(body);
  const classes = empty ? `${className} is-placeholder` : className;
  return `<div class="${classes}" data-placeholder="${placeholder}">${empty ? "<br>" : body}</div>`;
}

function categoryLabelHtml(
  categoryId: string,
  labels?: Record<string, string>
): string {
  const id = categoryId || "uncategorized";
  const label = formatCategoryLabel(id, labels);
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

const EXPAND_ICON_SVG =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.25" aria-hidden="true">` +
  `<path d="M6 9l6 6 6-6"/>` +
  `</svg>`;

function expandButtonHtml(): string {
  return (
    `<button type="button" class="thought-expand" contenteditable="false" tabindex="-1" aria-label="Expand thought" aria-expanded="false">` +
    EXPAND_ICON_SVG +
    `</button>`
  );
}

const CHECK_ICON_SVG =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.75" aria-hidden="true">` +
  `<path d="M20 6L9 17l-5-5"/>` +
  `</svg>`;

function thoughtCheckHtml(): string {
  return (
    '<button type="button" class="thought-check" contenteditable="false" aria-label="Toggle complete">' +
    `<span class="thought-check-box">${CHECK_ICON_SVG}</span>` +
    "</button>"
  );
}

type ThoughtItemOptions = {
  thoughtId?: string;
  showGraphButton?: boolean;
  isCompletable?: boolean;
  isCompleted?: boolean;
  startCollapsed?: boolean;
  hasEnteredTitle?: boolean;
};

function thoughtItemHtml(
  categoryId: string,
  fieldsHtml: string,
  options: ThoughtItemOptions = {},
  labels?: Record<string, string>
): string {
  const id = categoryId || "uncategorized";
  const thoughtIdAttr = options.thoughtId
    ? ` data-thought-id="${escapeHtml(options.thoughtId)}"`
    : "";
  const completable = Boolean(options.isCompletable);
  const completed = completable && Boolean(options.isCompleted);
  const classNames = ["thought-item"];
  if (completable) classNames.push("is-checklist");
  if (completed) classNames.push("is-completed");
  if (options.startCollapsed) classNames.push("is-collapsed");
  if (options.hasEnteredTitle) classNames.push("has-entered-title");
  const graph =
    options.showGraphButton && options.thoughtId
      ? graphButtonHtml(options.thoughtId)
      : "";
  return (
    `<li class="${classNames.join(" ")}" data-category-id="${escapeHtml(id)}" data-completable="${completable}" data-completed="${completed}"${thoughtIdAttr}>` +
    `<div class="thought-rail" contenteditable="false">` +
    `<div class="thought-stripe"></div>` +
    `<div class="thought-dot"></div>` +
    `</div>` +
    thoughtCheckHtml() +
    `<div class="thought-body">` +
    categoryLabelHtml(id, labels) +
    `<div class="${FIELDS_CLASS}">${fieldsHtml}</div>` +
    `</div>` +
    graph +
    expandButtonHtml() +
    `</li>`
  );
}

/** Compact NLP label suitable as a thought heading (not a copy of the body). */
export function compactSemanticLabel(thought: {
  semanticLabel?: string | null;
  summary?: string | null;
}): string {
  const label = stripHtml(thought.semanticLabel ?? "");
  const summary = stripHtml(thought.summary ?? "");
  if (!isDisplayableSemanticLabel(label, summary)) return "";
  return thought.semanticLabel?.trim() ?? label;
}

function liToHtml(
  thought: ThoughtsFormValue,
  showTitles: boolean,
  showGraphButton: boolean,
  placeholders: Pick<ThoughtFieldPlaceholders, "title" | "summary" | "bullet">,
  labels?: Record<string, string>,
  viewMode = false
) {
  const categoryId = thought.categoryId || "uncategorized";
  const enteredTitle = stripHtml(thought.title);
  const semanticTitle = compactSemanticLabel(thought);
  const titleValue = enteredTitle
    ? thought.title
    : semanticTitle
      ? thought.semanticLabel
      : "";
  const showTitleField = viewMode
    ? Boolean(stripHtml(titleValue))
    : showTitles || Boolean(stripHtml(titleValue));
  const options: ThoughtItemOptions = {
    thoughtId: thought.thoughtId || thought.id,
    showGraphButton,
    startCollapsed: showGraphButton || !viewMode,
    isCompletable: thought.isCompletable,
    isCompleted: thought.isCompleted,
    hasEnteredTitle: Boolean(stripHtml(titleValue)),
  };

  if (showTitleField) {
    return thoughtItemHtml(
      categoryId,
      titledFieldHtml(TITLE_CLASS, placeholders.title, titleValue) +
        titledFieldHtml(SUMMARY_CLASS, placeholders.summary, thought.summary),
      options,
      labels
    );
  }

  const summaryText = thought.summary || thought.title;
  return thoughtItemHtml(
    categoryId,
    titledFieldHtml(SUMMARY_CLASS, placeholders.bullet, summaryText),
    options,
    labels
  );
}

export type ThoughtsToHtmlOptions = {
  showGraphButtons?: boolean;
  placeholders?: Pick<ThoughtFieldPlaceholders, "title" | "summary" | "bullet">;
  categoryLabels?: Record<string, string>;
  /** View mode: hide empty title placeholders; generated headings still show. */
  preferSemanticTitle?: boolean;
};

/** Serialize thoughts into an HTML unordered list for the rich editor. */
export function thoughtsToHtml(
  thoughts: ThoughtsFormValue[],
  showTitles: boolean,
  options: ThoughtsToHtmlOptions = {}
): string {
  const showGraphButtons = options.showGraphButtons ?? false;
  const viewMode = options.preferSemanticTitle ?? false;
  const labels = options.categoryLabels;
  const placeholders = {
    title: options.placeholders?.title ?? TITLE_PLACEHOLDER,
    summary: options.placeholders?.summary ?? SUMMARY_PLACEHOLDER,
    bullet: options.placeholders?.bullet ?? BULLET_PLACEHOLDER,
  };

  if (thoughts.length === 0) {
    const body = showTitles
      ? titledFieldHtml(TITLE_CLASS, placeholders.title, "") +
        titledFieldHtml(SUMMARY_CLASS, placeholders.summary, "")
      : titledFieldHtml(SUMMARY_CLASS, placeholders.bullet, "");
    return `<ul>${thoughtItemHtml(
      "uncategorized",
      body,
      { startCollapsed: !viewMode || showGraphButtons },
      labels
    )}</ul>`;
  }

  return `<ul>${thoughts
    .map((thought) =>
      liToHtml(
        thought,
        showTitles,
        showGraphButtons,
        placeholders,
        labels,
        viewMode
      )
    )
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
        semanticLabel: preservedSemanticLabel(
          base,
          showTitles ? plain : base.title,
          showTitles ? base.summary : plain
        ),
      },
    ];
  }

  const next = liItems.map((item, index) => {
    const base = previous[index] ?? createEmptyThought(noteId);
    const contentHtml = stripChrome(item.innerHtml);
    const categoryId = item.categoryId || base.categoryId || "uncategorized";

    const { title, summary, hasTitleField, hasSummaryField } =
      parseTitledLi(contentHtml);
    const isCompletable = item.isCompletable ?? base.isCompletable ?? false;
    const isCompleted = isCompletable
      ? (item.isCompleted ?? base.isCompleted ?? false)
      : false;

    if (hasTitleField || showTitles) {
      // Only fall back to previous values when the field node is missing from
      // the HTML (e.g. mid-init). Present-but-empty fields must clear so
      // validation can re-run after the user dismisses error placeholders.
      const nextTitle = hasTitleField ? title : title || base.title;
      const nextSummary = hasSummaryField ? summary : summary || base.summary;
      const resolvedTitle = resolveEditableTitle(base, nextTitle);
      return {
        ...base,
        title: resolvedTitle.title,
        summary: nextSummary,
        categoryId,
        semanticLabel: resolvedTitle.clearSemantic
          ? ""
          : preservedSemanticLabel(base, resolvedTitle.title, nextSummary),
        isCompletable,
        isCompleted,
      };
    }

    const summaryField = extractByClass(contentHtml, SUMMARY_CLASS);
    const nextSummaryHtml = sanitizeInlineHtml(
      summaryField != null ? summaryField : contentHtml
    );
    // Present-but-empty `.thought-summary` must clear, not keep stale text.
    const nextSummary =
      summaryField != null ? nextSummaryHtml : nextSummaryHtml || base.summary;
    return {
      ...base,
      summary: nextSummary,
      categoryId,
      semanticLabel: preservedSemanticLabel(base, base.title, nextSummary),
      isCompletable,
      isCompleted,
    };
  });

  const trimmed = next.filter(
    (thought, index) =>
      index === 0 ||
      stripHtml(thought.title).length > 0 ||
      stripHtml(thought.summary).length > 0
  );

  return trimmed.length > 0 ? trimmed : [createEmptyThought(noteId)];
}

/** Build a JS snippet that updates one thought's category chrome in the editor. */
export function setThoughtCategoryScript(
  index: number,
  categoryId: string,
  label?: string
): string {
  const id = JSON.stringify(categoryId || "uncategorized");
  const chipLabel = JSON.stringify(
    label || formatCategoryLabel(categoryId || "uncategorized")
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
  var label = ${chipLabel};
  li.setAttribute("data-category-id", categoryId);
  var chip = li.querySelector(".thought-category");
  if (chip) {
    chip.setAttribute("data-category-id", categoryId);
    var name = chip.querySelector(".thought-category-name");
    if (name) name.textContent = label;
  }
  if (!window.__mcEditing && typeof window.__mcExpandThoughtCategory === "function") {
    window.__mcExpandThoughtCategory(li);
  } else if (typeof window.__mcAnimateTitle === "function") {
    window.__mcAnimateTitle(li);
  }
  try {
    content.dispatchEvent(new Event("input", { bubbles: true }));
  } catch (e) {}
  return true;
})();
`;
}

export function setThoughtSemanticTitleScript(
  index: number,
  title: string
): string {
  const label = JSON.stringify(title);
  return `
(function () {
  var content =
    document.querySelector(".pell-content") || document.getElementById("editor");
  if (!content) return true;
  var lis = content.querySelectorAll("ul > li");
  var li = lis[${index}];
  if (!li) return true;
  var text = ${label};
  if (!text) return true;
  var fields = li.querySelector(".thought-fields") || li;
  var titleEl = li.querySelector(".thought-title");
  if (!titleEl) {
    titleEl = document.createElement("div");
    titleEl.className = "thought-title";
    titleEl.setAttribute("data-placeholder", "Title");
    fields.insertBefore(titleEl, fields.firstChild);
  }
  titleEl.classList.remove("is-placeholder");
  titleEl.classList.remove("is-error-placeholder");
  titleEl.textContent = text;
  li.classList.add("has-entered-title");
  if (typeof window.__mcAnimateTitle === "function") {
    window.__mcAnimateTitle(li);
  }
  if (typeof window.__mcSyncChecklistLayouts === "function") {
    window.__mcSyncChecklistLayouts();
  }
  return true;
})();
`;
}

export function buildCategoryLabelsScript(
  labels: Record<string, string>
): string {
  return `
(function () {
  window.__mcCategoryLabels = ${JSON.stringify(labels)};
  var content =
    document.querySelector(".pell-content") || document.getElementById("editor");
  if (!content) return true;
  var chips = content.querySelectorAll(".thought-category");
  for (var i = 0; i < chips.length; i++) {
    var chip = chips[i];
    var id = chip.getAttribute("data-category-id") || "uncategorized";
    var label = window.__mcCategoryLabels[id];
    if (!label) continue;
    var name = chip.querySelector(".thought-category-name");
    if (name) name.textContent = label;
  }
  return true;
})();
`;
}
