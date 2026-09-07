import { Pressable, View } from "react-native";
import { Typography } from "@/components/ui/typography";
import type { Router } from "expo-router";
import { ReactNode } from "react";

export const CARD_MENU_SLOT_WIDTH = 20;

/** Push after the current press so Android screens aren't torn down mid-touch. */
export function pushNoteDetails(
  push: Router["push"],
  id: string,
  extra?: { mode?: string }
) {
  requestAnimationFrame(() => {
    push({
      pathname: "/notes/[id]",
      params: extra?.mode ? { id, mode: extra.mode } : { id },
    });
  });
}

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
  <View
    className="flex-row gap-2 justify-between items-start"
    pointerEvents="box-none"
  >
    {onTitlePress ? (
      <Pressable className="flex-1" onPress={onTitlePress}>
        <Typography variant="h3">{title.toUpperCase()}</Typography>
      </Pressable>
    ) : (
      <View className="flex-1" pointerEvents="none">
        <Typography variant="h3">{title.toUpperCase()}</Typography>
      </View>
    )}
    <View className="flex-row items-center gap-1" pointerEvents="box-none">
      {trailingActions}
      {menu ? (
        <View
          className="relative items-center justify-center pt-1"
          pointerEvents="auto"
          style={{ width: CARD_MENU_SLOT_WIDTH }}
        >
          {menu}
        </View>
      ) : null}
    </View>
  </View>
);
