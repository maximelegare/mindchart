import { memo } from "react";
import { View } from "react-native";
import { Button } from "@/components/ui";
import { Separator } from "@/components/ui/separator";
import { Typography } from "@/components/ui/typography";
import { DisplayDate } from "@/components/ui/date";
import { Icon } from "@/components/ui/icons/icon";
import { useRouter } from "expo-router";
import { Note } from "@repo/zod-schemas";

export const NoteWithoutOverview: React.FC<Note> = memo(
  ({ title, id, createdAt }) => {
    const { push } = useRouter();

    return (
      <>
        <View className="bg-card border-border border w-full rounded-lg p-2 pb-3">
          <View>
            <View className="flex-row items-center justify-between mb-1">
              <DisplayDate date={createdAt} />
            </View>
            <Separator className="mb-2" color="border" />
            <View className="flex-row gap-2 justify-between items-start">
              <View className="flex-1">
                <Typography variant="h3">{title.toUpperCase()}</Typography>
              </View>
              <View className="relative" style={{ width: 20 }}>
                <Button
                  className="absolute right-0"
                  style={{ top: -10 }}
                  variant="ghost"
                  size="icon"
                  onPress={() =>
                    push({ pathname: "/notes/[id]", params: { id: id } })
                  }
                >
                  <Icon name="chevron-right" color="text" />
                </Button>
              </View>
            </View>
          </View>
        </View>
      </>
    );
  }
);
