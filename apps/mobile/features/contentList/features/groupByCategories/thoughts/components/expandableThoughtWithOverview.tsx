import { memo, ReactElement, ReactNode } from "react";
import { View } from "react-native";
import { Separator } from "@/components/ui/separator";
import { CollapsibleContainer } from "@/components/ui/collapsibleContainer";
import { Typography } from "@/components/ui/typography";
import { DisplayDate } from "@/components/ui/date";
import { Icon } from "@/components/ui/icons/icon";
import { useRouter } from "expo-router";
import { CardTitleRow } from "@/features/contentList/components/cards/shared/cardTitleRow";
import { StaticCheckboxMark } from "@/features/contentList/components/cards/shared/staticCheckboxMark";
import { Button } from "@/components/ui";

type ExpandableThoughtProps = {
  id: string;
  noteId: string;
  title: string;
  date?: string | null;
  children: ReactElement | ReactNode;
  expanded: boolean;
  onPress?: (id: string) => void;
  isChecklist?: boolean;
  isCompleted?: boolean;
};

export const ExpandableThoughtWithOverview: React.FC<ExpandableThoughtProps> =
  memo(
    ({
      children,
      title,
      id,
      noteId,
      date,
      onPress,
      expanded,
      isChecklist,
      isCompleted,
    }) => {
      const { push } = useRouter();

      return (
        <View className="bg-card w-full rounded-2xl p-3.5 pb-4">
          <View className="flex-row items-center justify-between mb-1">
            <DisplayDate date={date} />
          </View>
          <Separator className="mb-2" color="border" />
          <View className="flex-row items-center gap-2">
            {isChecklist ? (
              <StaticCheckboxMark completed={Boolean(isCompleted)} />
            ) : null}
            <View className="flex-1">
              <CardTitleRow
                title={title}
                onTitlePress={() =>
                  push({ pathname: "/notes/[id]", params: { id: noteId } })
                }
              />
            </View>
          </View>
          <View
            className="flex-row items-center justify-between"
            style={{ marginTop: 20 }}
          >
            <Button
              variant="outline"
              size="xs"
              className="flex-row items-center gap-2 px-1"
              onPress={() => onPress?.(id)}
            >
              <Icon
                name={expanded ? "chevron-up" : "chevron-down"}
                color="text"
                style={{ marginTop: 4 }}
                size={15}
              />
              <Typography style={{ fontSize: 10 }} variant="p">
                {expanded ? "Hide Overview" : "Show Overview"}
              </Typography>
            </Button>
          </View>

          <CollapsibleContainer expanded={expanded}>
            {children}
          </CollapsibleContainer>
        </View>
      );
    },
    (prevProps, nextProps) =>
      prevProps.expanded === nextProps.expanded &&
      prevProps.title === nextProps.title &&
      prevProps.id === nextProps.id &&
      prevProps.isChecklist === nextProps.isChecklist &&
      prevProps.isCompleted === nextProps.isCompleted
  );
