import { Typography } from "@/components/ui";
import { Note } from "@repo/zod-schemas";
import { View } from "react-native";

interface NoteResultProps {
  data: Note;
}

export const NoteResult = ({ data }: NoteResultProps) => {
  return (
    <View>
      <Typography variant="h3">{data.title}</Typography>
      <Typography variant="p">{data.summary}</Typography>
    </View>
  );
};
