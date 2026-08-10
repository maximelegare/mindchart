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
import { IconName } from "@/components/ui/icons/icon-registry";

type HeaderContentProps = {
  title?: string;
  subtitle?: {
    text: string;
    icon?: IconName;
  };
  /** Replaces the default subtitle row when provided. */
  subtitleContent?: React.ReactNode;
  hideBackButton?: boolean;
  showLogo?: boolean;
  /** Header action buttons. Logic stays with the caller; this only renders them. */
  buttons?: React.ReactNode[];
  moreOptionsMenu?: {
    links: MoreOptionsMenuProps["links"];
    state: { open: boolean; setOpen: (open: boolean) => void };
    trigger?: MoreOptionsMenuProps["trigger"];
    currentWorkspace?: boolean;
  };
};

export const HeaderContent = ({
  title,
  hideBackButton = false,
  buttons,
  moreOptionsMenu,
  showLogo = false,
  subtitle,
  subtitleContent,
}: HeaderContentProps) => {
  const { links, state, trigger, currentWorkspace } = moreOptionsMenu ?? {};
  const { back } = useRouter();

  return (
    <View className="w-full flex-row items-center justify-between">
      <View className="min-w-0 flex-1 flex-row items-center">
        {showLogo && <LogoWithText />}
        {!hideBackButton && (
          <Button variant="ghost" size="icon" onPress={() => back()}>
            <Icon color="popover-foreground" name="arrow-left" />
          </Button>
        )}
        <View className="min-w-0 flex-1">
          {title && (
            <Typography
              variant="h3"
              numberOfLines={1}
              className="shrink text-popover-foreground font-light"
            >
              {title}
            </Typography>
          )}
          {subtitleContent ? (
            <View style={{ alignSelf: "flex-start" }}>{subtitleContent}</View>
          ) : (
            <View className="flex-row items-center gap-1 mr-1">
              {subtitle?.icon && (
                <Icon
                  size={12}
                  color="popover-foreground"
                  name={subtitle.icon}
                />
              )}
              {subtitle && (
                <Typography
                  variant="h4"
                  numberOfLines={1}
                  className="shrink text-sm text-popover-foreground leading-tight"
                >
                  {subtitle.text}
                </Typography>
              )}
            </View>
          )}
        </View>
      </View>
      <View className="shrink-0 flex-row items-center gap-1">
        <View className="flex-row items-center">
          {buttons?.map((button, index) => (
            <React.Fragment key={index}>{button}</React.Fragment>
          ))}
        </View>
        {links && state && (
          <MoreOptionsMenu
            links={links}
            state={state}
            trigger={trigger}
            currentWorkspace={currentWorkspace}
          />
        )}
      </View>
    </View>
  );
};
