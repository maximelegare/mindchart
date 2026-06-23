import { memo } from "react";
import { View } from "react-native";
import { Typography } from "@/components/ui/typography";
import { DisplayDate } from "@/components/ui/date";
import { Separator } from "@/components/ui/separator";
import { TopicWithNotesInfos } from "@repo/zod-schemas/src/schemas";
import { TopicBottomSheet } from "../../topicBottomSheet";
import { useEditTopic } from "../../editTopic/services/useEditTopic";
import { CardTitleRow } from "@/features/contentList/components/cards/shared/cardTitleRow";
import { router } from "expo-router";

export const TopicItem: React.FC<TopicWithNotesInfos> = memo((topic) => {
  const { name, noteCount, createdAt } = topic;
  const { openEditTopicModal } = useEditTopic(topic);

  return (
    <View className="bg-card border-border border w-full rounded-lg p-2 pb-3">
      <View className="flex-row items-center justify-between mb-1">
        <DisplayDate date={createdAt} />
      </View>
      <Separator className="mb-2" color="border" />
      <CardTitleRow
        onTitlePress={() =>
          router.push({
            pathname: "/topics/[id]",
            params: {
              id: topic.id,
            },
          })
        }
        title={name}
        menu={
          <TopicBottomSheet topic={topic} onEditPress={openEditTopicModal} />
        }
      />
      <View
        className="flex-row items-center justify-between"
        style={{ marginTop: 12 }}
      >
        <Typography variant="muted">Associated notes: {noteCount}</Typography>
      </View>
    </View>
  );
});
