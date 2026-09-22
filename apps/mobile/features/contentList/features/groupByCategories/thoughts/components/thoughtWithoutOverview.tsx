import { memo } from "react";
import { Pressable, View } from "react-native";
import { Separator } from "@/components/ui/separator";
import { DisplayDate } from "@/components/ui/date";
import { useRouter } from "expo-router";
import { Thought } from "@repo/zod-schemas";
import {
  CardTitleRow,
  pushNoteDetails,
} from "@/features/contentList/components/cards/shared/cardTitleRow";
import { StaticCheckboxMark } from "@/features/contentList/components/cards/shared/staticCheckboxMark";

export const ThoughtWithoutOverview: React.FC<Thought> = memo(
  ({ title, noteId, createdAt, type, content }) => {
    const { push } = useRouter();
    const isChecklist = type === "checkbox";
    const isCompleted = isChecklist && content.checked;

    return (
      <Pressable
        onPress={() => pushNoteDetails(push, noteId)}
        accessibilityRole="button"
        accessibilityLabel={title}
        className="bg-card w-full rounded-2xl p-3.5 pb-4"
      >
        <View className="flex-row items-center justify-between mb-1">
          <DisplayDate date={createdAt} />
        </View>
        <Separator className="mb-2" color="border" />
        <View className="flex-row items-center gap-2">
          {isChecklist ? (
            <StaticCheckboxMark completed={Boolean(isCompleted)} />
          ) : null}
          <View className="flex-1">
            <CardTitleRow title={title} />
          </View>
        </View>
      </Pressable>
    );
  }
);
