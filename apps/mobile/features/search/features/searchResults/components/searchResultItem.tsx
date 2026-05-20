import { Note, Thought } from "@repo/zod-schemas";
import { NoteResult } from "./resultsItems/noteResult";
import { ThoughtsResult } from "./resultsItems/thoughtsResult";
import { FC } from "react";

interface SearchResultItemProps {
  type: "notes" | "thoughts";
  result: Thought | Note;
}

export const SearchResultItem: FC<SearchResultItemProps> = ({
  type,
  result,
}) => {
  const query = "title";
  switch (type) {
    case "notes":
      return <NoteResult query={query} />;
    case "thoughts":
      return <ThoughtsResult data={result as Thought} />;
  }
};
