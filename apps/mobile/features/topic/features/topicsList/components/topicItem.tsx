import { memo } from "react";
import { Pressable, View } from "react-native";
import { Button } from "@/components/ui";
import { Typography } from "@/components/ui/typography";
import { DisplayDate } from "@/components/ui/date";
import { Icon } from "@/components/ui/icons/icon";
import { TopicWithNotesInfos } from "@repo/zod-schemas/src/schemas";

export const TopicItem: React.FC<TopicWithNotesInfos> = memo(
  ({ name, noteCount, createdAt }) => {
    return (
      <>
        <View className="bg-card border-border border w-full rounded-lg p-2">
          <Pressable>
            <View>
              <View className="flex-row items-center justify-between mb-1">
                <DisplayDate date={createdAt} />
              </View>
              {/* <Separator className="mb-2" color="border" /> */}
              <View className="flex-row gap-2 justify-between items-center">
                <View className="flex-1">
                  <Typography variant="h3">{name.toUpperCase()}</Typography>
                </View>
                <View>
                  <Button
                    variant="ghost"
                    className="p-2"
                    size="xs"
                    onPress={() => console.log("delete topic")}
                  >
                    <Icon
                      name="trash-2"
                      color="destructive-foreground"
                      opacity={50}
                      size={20}
                    />
                  </Button>
                </View>
              </View>

              <View className="flex-row items-center justify-between mb-1">
                <Typography variant="muted">
                  Associated notes: {noteCount}
                </Typography>
              </View>
            </View>
          </Pressable>
        </View>
      </>
    );
  }
);
