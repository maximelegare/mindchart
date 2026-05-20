import React from "react";
import { Typography, TypographyProps } from "@/components/ui";
import { cn } from "@/lib/cn";

type HighlightProps = TypographyProps & {
  text: string;
  query: string;
  highlightClassName?: string;
  className?: string;
  contextWindow?: number;
  minLengthToTrim?: number;
};

export const Highlight = ({
  text,
  query,
  className,
  variant,
  highlightClassName = "bg-input",
  contextWindow = 20,
  ...props
}: HighlightProps) => {
  if (!query.trim()) {
    return (
      <Typography variant={variant} className={className} {...props}>
        {text}
      </Typography>
    );
  }

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  const matches: number[] = [];

  let idx = lowerText.indexOf(lowerQuery);
  while (idx !== -1) {
    matches.push(idx);
    idx = lowerText.indexOf(lowerQuery, idx + 1);
  }

  if (matches.length === 0) {
    return (
      <Typography variant={variant} className={className} {...props}>
        {text.slice(0, contextWindow)}
        {" ... "}
        {text.slice(-contextWindow)}
      </Typography>
    );
  }

  // -----------------------------------
  // 1. Build windows per match
  // -----------------------------------
  const windows = matches.map((m) => ({
    start: Math.max(0, m - contextWindow),
    end: Math.min(text.length, m + query.length + contextWindow),
  }));

  // -----------------------------------
  // 2. Merge overlapping windows
  // -----------------------------------
  windows.sort((a, b) => a.start - b.start);

  const merged: { start: number; end: number }[] = [];

  for (const w of windows) {
    const last = merged[merged.length - 1];

    if (!last || w.start > last.end) {
      merged.push({ ...w });
    } else {
      last.end = Math.max(last.end, w.end);
    }
  }

  // -----------------------------------
  // 3. Build final display text
  // -----------------------------------
  const displayText = merged.map((w) => text.slice(w.start, w.end)).join(" … ");

  const prefix = merged[0].start > 0 ? " … " : "";
  const suffix = merged[merged.length - 1].end < text.length ? " … " : "";

  // -----------------------------------
  // 4. Highlight ALL matches in final snippet
  // -----------------------------------
  const parts = displayText.split(new RegExp(`(${escapeRegex(query)})`, "gi"));

  return (
    <Typography className={className} variant={variant} {...props}>
      {prefix}
      {parts.map((part, i) => {
        const isMatch = part.toLowerCase() === lowerQuery;

        return (
          <Typography
            key={i}
            variant={variant}
            className={cn(isMatch ? highlightClassName : undefined, className)}
          >
            {part}
          </Typography>
        );
      })}
      {suffix}
    </Typography>
  );
};

function escapeRegex(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
