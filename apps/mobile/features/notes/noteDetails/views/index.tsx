import React from "react";
import { ScrollView, View } from "react-native";
import { Typography } from "@/components/ui/typography";
import { parseNoteAndThoughts } from "@/features/notes/shared/utils/parseNoteAndThoughts";
import { DisplayDate } from "@/components/ui/date";
import { Card } from "@/components/ui/card";
import ThoughtsList from "@/features/notes/noteDetails/components/ThoughtsList";
import { RawTextViewer } from "@/features/notes/noteDetails/components/RawText";

type NoteDetailsFeatureProps = {
  isPending: boolean;
  note: ReturnType<typeof parseNoteAndThoughts>;
};

export const NoteDetailsFeature = ({
  isPending,
  note,
}: NoteDetailsFeatureProps) => {
  if (isPending) return null;
  if (!note) return null;

  const { title, createdAt, rawText, thoughts } = note[0];

  return (
    <View className="flex-col w-full">
      <Card className="p-2 w-full">
        <View className="flex-row w-full items-center justify-between gap-2">
          <Typography variant="h3" className="flex-1 shrink">
            {title.toUpperCase()}
          </Typography>
          {rawText ? <RawTextViewer rawText={rawText} /> : null}
        </View>
        <DisplayDate size="md" date={createdAt} className="pb-4" />

        <Typography variant="h4" className="text-border">
          Thoughts
        </Typography>
        <ScrollView>
          <ThoughtsList thoughts={thoughts} />
        </ScrollView>
      </Card>
    </View>
  );
};
