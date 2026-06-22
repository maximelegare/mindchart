import { Pressable, View } from "react-native";
import { Typography } from "@/components/ui/typography";
import { ReactNode } from "react";

export const CARD_MENU_SLOT_WIDTH = 20;

type CardTitleRowProps = {
  title: string;
  onTitlePress?: () => void;
  trailingActions?: ReactNode;
  menu?: ReactNode;
};

export const CardTitleRow = ({
  title,
  onTitlePress,
  trailingActions,
  menu,
}: CardTitleRowProps) => (
  <View className="flex-row gap-2 justify-between items-start">
    {onTitlePress ? (
      <Pressable className="flex-1" onPress={onTitlePress}>
        <Typography variant="h3">{title.toUpperCase()}</Typography>
      </Pressable>
    ) : (
      <View className="flex-1">
        <Typography variant="h3">{title.toUpperCase()}</Typography>
      </View>
    )}
    <View className="flex-row items-center gap-1">
      {trailingActions}
      {menu ? (
        <View
          className="relative items-center justify-center pt-1"
          style={{ width: CARD_MENU_SLOT_WIDTH }}
        >
          {menu}
        </View>
      ) : null}
    </View>
  </View>
);
