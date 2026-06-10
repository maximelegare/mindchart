import { memo } from "react";
import { Pressable, View } from "react-native";
import { Typography } from "@/components/ui/typography";
import { DisplayDate } from "@/components/ui/date";
import { TopicWithNotesInfos } from "@repo/zod-schemas/src/schemas";
import { TopicBottomSheet } from "../../topicBottomSheet";
import { useEditTopic } from "../../editTopic/services/useEditTopic";

export const TopicItem: React.FC<TopicWithNotesInfos> = memo((topic) => {
  const { name, noteCount, createdAt } = topic;
  const { openEditTopicModal } = useEditTopic(topic);
  return (
    <>
      <View className="bg-card border-border border w-full rounded-lg p-2">
        <Pressable>
          <View>
            <View className="pb-1 flex-row items-center justify-between">
              <DisplayDate date={createdAt} />
            </View>
            {/* <Separator className="mb-2" color="border" /> */}
            <View className="pb-2 flex-row gap-2 justify-between items-center">
              <View className="flex-1">
                <Typography variant="h3">{name.toUpperCase()}</Typography>
              </View>
              <View>
                {/* Passing the onEditPress function to the TopicBottomSheet because it generates the embedding in the modal */}
                <TopicBottomSheet
                  topic={topic}
                  onEditPress={openEditTopicModal}
                />
              </View>
            </View>

            <View className="flex-row items-center justify-between">
              <Typography variant="muted">
                Associated notes: {noteCount}
              </Typography>
            </View>
          </View>
        </Pressable>
      </View>
    </>
  );
});
