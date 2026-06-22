import { memo } from "react";
import { View } from "react-native";
import { Separator } from "@/components/ui/separator";
import { DisplayDate } from "@/components/ui/date";
import { useRouter } from "expo-router";
import { Thought } from "@repo/zod-schemas";
import { CardTitleRow } from "@/features/contentList/components/cards/shared/cardTitleRow";

export const ThoughtWithoutOverview: React.FC<Thought> = memo(
  ({ title, noteId, createdAt }) => {
    const { push } = useRouter();

    return (
      <View className="bg-card border-border border w-full rounded-lg p-2 pb-3">
        <View className="flex-row items-center justify-between mb-1">
          <DisplayDate date={createdAt} />
        </View>
        <Separator className="mb-2" color="border" />
        <CardTitleRow
          title={title}
          onTitlePress={() =>
            push({ pathname: "/notes/[id]", params: { id: noteId } })
          }
        />
      </View>
    );
  }
);
