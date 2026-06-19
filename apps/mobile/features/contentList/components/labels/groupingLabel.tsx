import { Typography } from "@/components/ui";
import { Icon } from "@/components/ui/icons/icon";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { Link } from "expo-router";
import { LinkProps } from "expo-router";
import { ReactNode } from "react";
import { View } from "react-native";

type GroupingLabelProps = {
  colorBadge?: string;
  label: string;
  href?: LinkProps["href"];
  children?: ReactNode;
};

export const GroupingLabel = ({
  label,
  href,
  colorBadge,
}: GroupingLabelProps) => {
  const { colorScheme } = useColorScheme();

  return (
    <View className="w-full flex-row items-center">
      <View
        className="flex-row items-center gap-2 rounded-full border border-border bg-muted px-2 py-1"
        style={{ alignSelf: "flex-start", flexGrow: 0 }}
      >
        {colorBadge ? (
          <View
            className="h-4 w-4 rounded-full"
            style={{
              backgroundColor: colorBadge,
              borderWidth: 1,
              borderColor: hsl("muted", colorScheme),
            }}
          />
        ) : null}
        <Typography variant="muted">{label}</Typography>
        {href ? (
          <Link href={href} asChild>
            <Icon name="chevron-right" color="text" />
          </Link>
        ) : null}
      </View>
      <View
        className="bg-border"
        style={{ flexGrow: 1, height: 1, alignSelf: "center" }}
      />
    </View>
  );
};
