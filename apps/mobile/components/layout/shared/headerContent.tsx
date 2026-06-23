import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons/icon";
import { Typography } from "@/components/ui/typography";
import { useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";
import {
  MoreOptionsMenu,
  MoreOptionsMenuProps,
} from "../header/moreOptions/moreOptionsMenu";
import { LogoWithText } from "@/components/ui/logo";

type HeaderContentProps = {
  title?: string;
  hideBackButton?: boolean;
  showLogo?: boolean;
  buttons?: React.ReactNode;
  moreOptionsMenu?: {
    links: MoreOptionsMenuProps["links"];
    state: { open: boolean; setOpen: (open: boolean) => void };
  };
};

export const HeaderContent = ({
  title,
  hideBackButton = false,
  buttons,
  moreOptionsMenu,
  showLogo = false,
}: HeaderContentProps) => {
  const { links, state } = moreOptionsMenu ?? {};
  const { back } = useRouter();

  return (
    <View className="w-full flex-row items-center justify-between">
      <View className="min-w-0 flex-1 flex-row items-center">
        {showLogo && <LogoWithText />}
        {!hideBackButton && (
          <Button variant="ghost" size="icon" onPress={() => back()}>
            <Icon color="background" name="arrow-left" />
          </Button>
        )}
        {title && (
          <Typography
            variant="h1"
            numberOfLines={1}
            className="shrink text-popover-foreground leading-tight"
          >
            {title}
          </Typography>
        )}
      </View>
      <View className="shrink-0 flex-row items-center">
        {buttons}
        {links && state && (
          <View className="-ml-2">
            <MoreOptionsMenu links={links} state={state} />
          </View>
        )}
      </View>
    </View>
  );
};
