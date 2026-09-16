import { useMemo } from "react";
import { View } from "react-native";
import { Typography } from "@/components/ui/typography";
import { Separator } from "@/components/ui/separator";
import { LoadingState } from "@/components/ui/modal/custom/loadingState/loadingState";
import { useControllers } from "@/api/controllers/useControllers";
import {
  NoteWithThoughts,
  thoughtToOverviewItem,
} from "@/features/contentList/components/cards/noteWithOverview";
import { parseNoteAndThoughts } from "@/features/notes/shared/utils/parseNoteAndThoughts";
import { GraphInfosNotesEmptyLabel } from "./graphInfosLabels";

export const GraphInfosNotesList = ({ noteIds }: { noteIds: string[] }) => {
  const { useFetchNotesByIdsWithThoughtsQuery } =
    useControllers().notesAndThoughts;
  const { data, isFetching, isPending } = useFetchNotesByIdsWithThoughtsQuery(
    noteIds,
    { enabled: noteIds.length > 0 }
  );

  const notes = useMemo(() => {
    const parsed = parseNoteAndThoughts(data) ?? [];
    const byId = new Map(parsed.map((note) => [note.id, note]));
    return noteIds
      .map((id) => byId.get(id))
      .filter((note): note is NonNullable<typeof note> => note != null);
  }, [data, noteIds]);

  if (noteIds.length === 0) {
    return (
      <View className="items-center justify-center px-4 py-8">
        <Typography variant="p" className="text-center text-muted-foreground">
          <GraphInfosNotesEmptyLabel />
        </Typography>
      </View>
    );
  }

  if ((isPending || isFetching) && notes.length === 0) {
    return <LoadingState size="small" />;
  }

  if (notes.length === 0) {
    return (
      <View className="items-center justify-center px-4 py-8">
        <Typography variant="p" className="text-center text-muted-foreground">
          <GraphInfosNotesEmptyLabel />
        </Typography>
      </View>
    );
  }

  return (
    <View className="mt-3">
      {notes.map((note, index) => (
        <View key={note.id}>
          {index > 0 ? <Separator className="my-3" /> : null}
          <NoteWithThoughts
            id={note.id}
            title={note.title}
            date={note.createdAt ?? ""}
            overviewItems={note.thoughts.map(thoughtToOverviewItem)}
            showAllContent
          />
        </View>
      ))}
    </View>
  );
};
