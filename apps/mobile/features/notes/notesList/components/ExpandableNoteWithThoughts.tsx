import { memo, ReactElement, ReactNode } from "react";
import { Pressable, View } from "react-native";
import { Button } from "@/components/ui";
import { Separator } from "@/components/ui/separator";
import { CollapsableContainer } from "@/components/ui/collapsibleContainer";
import { Typography } from "@/components/ui/typography";
import { DisplayDate } from "@/components/ui/date";
import { Icon } from "@/components/ui/icons/icon";
import { useRouter } from "expo-router";

type ListItemProps = {
  id: string;
  children: ReactElement | ReactNode;
  title: string;
  date?: string | null;
  category?: string | null;
  onPress?: (id: string) => void;
  expanded: boolean;
};

export const ExpandableNoteWithThoughts: React.FC<ListItemProps> = memo(
  ({ children, title, id, date, onPress, expanded }) => {
    const { push } = useRouter();

    return (
      <>
        <View className="bg-card border-border border w-full rounded-lg p-2">
          <Pressable onPress={() => onPress && onPress(id)}>
            <View>
              <View className="flex-row items-center justify-between mb-1">
                <DisplayDate date={date} />
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
              <View
                className="flex-row opacity-40 items-center"
                style={{ marginTop: 10 }}
              >
                <Icon
                  name={expanded ? "chevron-up" : "chevron-down"}
                  color="text"
                  size={20}
                />
                <Typography variant="p">overview</Typography>
              </View>
            </View>
          </Pressable>

          <CollapsableContainer expanded={expanded}>
            {children}
          </CollapsableContainer>
        </View>
      </>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.expanded === nextProps.expanded &&
      prevProps.title === nextProps.title &&
      prevProps.id === nextProps.id
    );
  }
);
