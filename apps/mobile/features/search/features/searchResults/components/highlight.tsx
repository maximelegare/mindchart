import React from "react";
import { Typography, TypographyProps } from "@/components/ui";
import { cn } from "@/lib/cn";
import { StyleProp, TextStyle } from "react-native";

type HighlightProps = TypographyProps & {
  text: string;
  query: string;
  highlightClassName?: string;
  className?: string;
  contextWindow?: number;
  minLengthToTrim?: number;
  style?: StyleProp<TextStyle>;
};

type HighlightRange = { start: number; end: number };

export const Highlight = ({
  text,
  query,
  className,
  variant,
  highlightClassName = "bg-input",
  contextWindow = 20,
  style,
  ...props
}: HighlightProps) => {
  const trimmedQuery = query.trim();

  // Require minimum 2 characters before rendering highlights
  if (!trimmedQuery || trimmedQuery.length < 2) {
    return (
      <Typography
        variant={variant}
        className={className}
        style={style}
        {...props}
      >
        {text}
      </Typography>
    );
  }

  const highlightRanges = getHighlightRanges(text, trimmedQuery);

  // If query isn't matched contiguously within this block of text, return contextual snippet
  if (highlightRanges.length === 0) {
    return (
      <Typography variant={variant} className={className} {...props}>
        {text.slice(0, contextWindow)}
        {" ... "}
        {text.slice(-contextWindow)}
      </Typography>
    );
  }

  const sorted = [...highlightRanges].sort((a, b) => a.start - b.start);
  const snippetStart = Math.max(0, sorted[0].start - contextWindow);
  const snippetEnd = Math.min(
    text.length,
    sorted[sorted.length - 1].end + contextWindow
  );
  const displayText = text.slice(snippetStart, snippetEnd);
  const prefix = snippetStart > 0 ? " … " : "";
  const suffix = snippetEnd < text.length ? " … " : "";

  const segments = splitByHighlightRanges(
    displayText,
    snippetStart,
    highlightRanges
  );

  return (
    <Typography className={className} variant={variant} {...props}>
      {prefix}
      {segments.map((seg, i) => (
        <Typography
          key={i}
          variant={variant}
          className={cn(
            seg.highlight ? highlightClassName : undefined,
            className
          )}
        >
          {seg.text}
        </Typography>
      ))}
      {suffix}
    </Typography>
  );
};

/** Finds strict, continuous raw substring locations bypassing arbitrary word-boundary checks. */
function getHighlightRanges(text: string, query: string): HighlightRange[] {
  if (query.length < 2) return [];

  const ranges: HighlightRange[] = [];
  const escapedQuery = escapeRegex(query);

  const re = new RegExp(escapedQuery, "gi");
  let match: RegExpExecArray | null;

  while ((match = re.exec(text)) !== null) {
    ranges.push({
      start: match.index,
      end: match.index + query.length,
    });

    if (match[0].length === 0) re.lastIndex++;
  }

  return ranges;
}

function splitByHighlightRanges(
  displayText: string,
  displayStart: number,
  ranges: HighlightRange[]
): { text: string; highlight: boolean }[] {
  const segments: { text: string; highlight: boolean }[] = [];
  let i = 0;

  while (i < displayText.length) {
    const abs = displayStart + i;
    const inRange = ranges.some((r) => abs >= r.start && abs < r.end);
    let j = i + 1;
    while (j < displayText.length) {
      const absJ = displayStart + j;
      const same = ranges.some((r) => absJ >= r.start && absJ < r.end);
      if (same !== inRange) break;
      j++;
    }
    segments.push({ text: displayText.slice(i, j), highlight: inRange });
    i = j;
  }

  return segments;
}

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
