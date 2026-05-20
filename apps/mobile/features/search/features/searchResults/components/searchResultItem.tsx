import { Note, Thought } from "@repo/zod-schemas";
import { NoteResult } from "./resultsItems/noteResult";
import { FC } from "react";

interface SearchResultItemProps {
  type: "notes" | "thoughts";
  result: Thought | Note;
}

export const SearchResultItem: FC<SearchResultItemProps> = ({ type }) => {
  const query = "the";
  switch (type) {
    case "notes":
      return <NoteResult query={query} />;
  }
};
