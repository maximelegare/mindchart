import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons/icon";
import { Typography } from "@/components/ui/typography";
import { cn } from "@/lib/cn";
import { useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";

type HeaderContentProps = {
  title: string;
  hideBackButton?: boolean;
  buttons?: React.ReactNode;
};

export const HeaderContent = ({
  title,
  hideBackButton = false,
  buttons,
}: HeaderContentProps) => {
  const { back } = useRouter();

  return (
    <View className="w-full flex-row items-center justify-between">
      <View className="w-fit flex-row  items-center">
        {!hideBackButton && (
          <Button variant="ghost" onPress={() => back()}>
            <Icon color="background" name="arrow-left" />
          </Button>
        )}

        <Typography
          variant="h1"
          className={cn(hideBackButton && "pl-4", "text-popover-foreground")}
        >
          {title ?? "Page"}
        </Typography>
      </View>
      <View className="flex-row">{buttons}</View>
    </View>
  );
};
