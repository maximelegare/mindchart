import { Typography } from "@/components/ui";
import { Thought } from "@repo/zod-schemas";
import { View } from "react-native";

interface ThoughtsResultProps {
  data: Thought;
}

export const ThoughtsResult = ({ data }: ThoughtsResultProps) => {
  return (
    <View>
      <Typography variant="h3">{data.title}</Typography>
      <Typography variant="p">{data.summary}</Typography>
    </View>
  );
};
