import { createEmptyThought, type ThoughtsFormValue } from "./types";

const TITLE_CLASS = "thought-title";
const SUMMARY_CLASS = "thought-summary";

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

function extractLiContents(html: string): string[] {
  const items: string[] = [];
  const liRegex = /<li\b[^>]*>([\s\S]*?)<\/li>/gi;
  let match: RegExpExecArray | null;
  while ((match = liRegex.exec(html)) !== null) {
    items.push(match[1] ?? "");
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

const TITLE_PLACEHOLDER = "Title";
const SUMMARY_PLACEHOLDER = "Summary";

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

function liToHtml(thought: ThoughtsFormValue, showTitles: boolean): string {
  if (showTitles) {
    const title = escapeHtml(thought.title);
    const summary = escapeHtml(thought.summary).replace(/\n/g, "<br>");
    return `<li>${titledFieldHtml(TITLE_CLASS, TITLE_PLACEHOLDER, title)}${titledFieldHtml(SUMMARY_CLASS, SUMMARY_PLACEHOLDER, summary)}</li>`;
  }

  const summary = escapeHtml(thought.summary).replace(/\n/g, "<br>") || "<br>";
  return `<li>${summary}</li>`;
}

/** Serialize thoughts into an HTML unordered list for the rich editor. */
export function thoughtsToHtml(
  thoughts: ThoughtsFormValue[],
  showTitles: boolean
): string {
  if (thoughts.length === 0) {
    return `<ul><li>${
      showTitles
        ? titledFieldHtml(TITLE_CLASS, TITLE_PLACEHOLDER, "") +
          titledFieldHtml(SUMMARY_CLASS, SUMMARY_PLACEHOLDER, "")
        : "<br>"
    }</li></ul>`;
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
  const liContents = extractLiContents(html);

  if (liContents.length === 0) {
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

  const next = liContents.map((liHtml, index) => {
    const base = previous[index] ?? createEmptyThought(noteId);

    if (showTitles) {
      const { title, summary } = parseTitledLi(liHtml);
      const label = title || summary || base.semanticLabel;
      return {
        ...base,
        title,
        summary,
        semanticLabel: label,
      };
    }

    const summary = stripHtml(liHtml);
    return {
      ...base,
      summary,
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
