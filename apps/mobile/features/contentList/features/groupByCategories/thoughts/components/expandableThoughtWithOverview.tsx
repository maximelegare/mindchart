import { memo, ReactElement, ReactNode } from "react";
import { View } from "react-native";
import { Separator } from "@/components/ui/separator";
import { CollapsibleContainer } from "@/components/ui/collapsibleContainer";
import { Typography } from "@/components/ui/typography";
import { DisplayDate } from "@/components/ui/date";
import { Icon } from "@/components/ui/icons/icon";
import { useRouter } from "expo-router";
import { CardTitleRow } from "@/features/contentList/components/cards/shared/cardTitleRow";
import { Button } from "@/components/ui";

type ExpandableThoughtProps = {
  id: string;
  noteId: string;
  title: string;
  date?: string | null;
  children: ReactElement | ReactNode;
  expanded: boolean;
  onPress?: (id: string) => void;
};

export const ExpandableThoughtWithOverview: React.FC<ExpandableThoughtProps> =
  memo(
    ({ children, title, id, noteId, date, onPress, expanded }) => {
      const { push } = useRouter();

      return (
        <View className="bg-card border-border border w-full rounded-lg p-2 pb-3">
          <View className="flex-row items-center justify-between mb-1">
            <DisplayDate date={date} />
          </View>
          <Separator className="mb-2" color="border" />
          <CardTitleRow
            title={title}
            onTitlePress={() =>
              push({ pathname: "/notes/[id]", params: { id: noteId } })
            }
          />
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
      prevProps.id === nextProps.id
  );
