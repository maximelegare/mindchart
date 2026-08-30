import { Button, Typography } from "@/components/ui";
import { Icon } from "@/components/ui/icons/icon";
import { Href, router } from "expo-router";
import { LinkProps } from "expo-router";
import { ReactNode } from "react";
import { Pressable, View } from "react-native";

type GroupingLabelProps = {
  colorBadge?: string;
  label: ReactNode;
  href?: LinkProps["href"];
  children?: ReactNode;
  expanded?: boolean;
  numberOfItems?: number;
  onPress?: () => void;
};

export const GroupingLabel = ({
  label,
  href,
  colorBadge,
  expanded = true,
  numberOfItems,
  onPress,
}: GroupingLabelProps) => {
  const handlePress = () => {
    if (href) {
      router.push(href as Href);
      return;
    }
    onPress?.();
  };
  return (
    <View className="flex-row items-center gap-2">
      <View className="flex-1 min-w-0 flex-row items-center">
        <Pressable
          onPress={handlePress}
          className="flex-row items-center gap-2 rounded-full border border-popover bg-popover px-2 py-1"
          style={{ alignSelf: "flex-start", flexGrow: 0 }}
        >
          {colorBadge ? (
            <View
              className="h-4 w-4 rounded-full"
              style={{
                backgroundColor: colorBadge,
              }}
            />
          ) : null}
          <Typography variant="small" className="text-popover-foreground">
            {label}
          </Typography>
          {numberOfItems ? (
            <Typography variant="small" className="text-popover-foreground">
              ({numberOfItems})
            </Typography>
          ) : null}
        </Pressable>
        <View
          className="bg-popover"
          style={{ flexGrow: 1, height: 1, alignSelf: "center" }}
        />
      </View>
      {onPress ? (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onPress={onPress}
        >
          <Icon
            name={expanded ? "chevron-up" : "chevron-down"}
            color="text"
            size={16}
          />
        </Button>
      ) : null}
    </View>
  );
};
