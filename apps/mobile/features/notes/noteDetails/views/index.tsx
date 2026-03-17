import { useControllers } from "@/api/controllers/useControllers";
import React from "react";
import { ScrollView, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Typography } from "@/components/ui/typography";
import { parseNoteAndThoughts } from "@/features/notes/shared/utils/parseNoteAndThoughts";
import { DisplayDate } from "@/components/ui/date";
import { Card } from "@/components/ui/card";
import ThoughtsList from "@/features/notes/noteDetails/components/ThoughtsList";

export const NoteDetailsFeature = () => {
  const local = useLocalSearchParams();
  const { useFetchNoteDetails } = useControllers().notesAndThoughts;

  const { data } = useFetchNoteDetails(local.id as string);

  const parsedData = parseNoteAndThoughts(data);

  if (!parsedData) return;
  const { title, created_at, thoughts } = parsedData[0];

  return (
    <View className="flex-col">
      <Card className="p-2">
        <Typography variant="h3">{title.toUpperCase()}</Typography>
        <DisplayDate size="md" date={created_at} className="pb-4" />

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
