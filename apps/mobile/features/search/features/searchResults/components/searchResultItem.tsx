import { SearchResultItemSchemaModel } from "@repo/zod-schemas";
import { NoteResult } from "./resultsItems/noteResult";
import { FC } from "react";

interface SearchResultItemProps {
  query: string;
  data: SearchResultItemSchemaModel;
}

export const SearchResultItem: FC<SearchResultItemProps> = ({
  query,
  data,
}) => {
  return <NoteResult query={query} data={data} />;
};
