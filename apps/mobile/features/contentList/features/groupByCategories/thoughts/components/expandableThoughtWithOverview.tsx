import { memo } from "react";
import { Pressable, View } from "react-native";
import { Separator } from "@/components/ui/separator";
import { Typography } from "@/components/ui/typography";
import { DisplayDate } from "@/components/ui/date";
import { useRouter } from "expo-router";
import {
  CardTitleRow,
  pushNoteDetails,
} from "@/features/contentList/components/cards/shared/cardTitleRow";
import { StaticCheckboxMark } from "@/features/contentList/components/cards/shared/staticCheckboxMark";

type ExpandableThoughtProps = {
  id: string;
  noteId: string;
  title: string;
  summary: string;
  date?: string | null;
  isChecklist?: boolean;
  isCompleted?: boolean;
};

export const ExpandableThoughtWithOverview: React.FC<ExpandableThoughtProps> =
  memo(
    ({ title, noteId, date, summary, isChecklist, isCompleted }) => {
      const { push } = useRouter();
      const displayTitle = title.trim();

      return (
        <Pressable
          onPress={() => pushNoteDetails(push, noteId)}
          accessibilityRole="button"
          accessibilityLabel={displayTitle || summary}
          className="bg-card w-full rounded-2xl p-3.5 pb-4"
        >
          <View className="flex-row items-center justify-between mb-1">
            <DisplayDate date={date} />
          </View>
          <Separator className="mb-2" color="border" />
          <View className="flex-row items-start gap-2">
            {isChecklist ? (
              <StaticCheckboxMark completed={Boolean(isCompleted)} />
            ) : null}
            <View className="flex-1 gap-1">
              {displayTitle ? <CardTitleRow title={displayTitle} /> : null}
              {summary ? (
                <Typography variant="p" padding={false}>
                  {summary}
                </Typography>
              ) : null}
            </View>
          </View>
        </Pressable>
      );
    },
    (prevProps, nextProps) =>
      prevProps.title === nextProps.title &&
      prevProps.summary === nextProps.summary &&
      prevProps.id === nextProps.id &&
      prevProps.isChecklist === nextProps.isChecklist &&
      prevProps.isCompleted === nextProps.isCompleted
  );
