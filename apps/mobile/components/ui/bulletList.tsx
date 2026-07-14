// components/BulletList.tsx
import React from "react";
import { View } from "react-native";
import { cn } from "@/lib/cn";
import { Typography } from "@/components/ui/typography";
import { Theme } from "@repo/theme/global";
import { hsl } from "@/utils/hsl";
import { useColorScheme } from "@/lib/useColorScheme";

type BulletListProps = {
  items: Array<React.ReactNode>; // each can be JSX or string
  bulletColor?: Theme;
  bulletSize?: number;
  spacing?: number;
  textClassName?: string;
  hideBullets?: boolean;
  bulletClassName?: string;
};

export const BulletList = ({
  items,
  bulletColor = "primary",
  bulletSize = 6,
  spacing = 12,
  textClassName = "text-base text-neutral-800",
  hideBullets = false,
  bulletClassName,
}: BulletListProps) => {
  const { colorScheme } = useColorScheme();

  return (
    <View className="flex flex-col ml-2">
      {items.map((item, index) => (
        <View
          key={index}
          className="flex-row items-start"
          style={{ marginBottom: spacing }}
        >
          {!hideBullets && (
            <View
              className={cn("rounded-full mr-2", bulletClassName)}
              style={{
                marginTop: 8,
                width: bulletSize,
                height: bulletSize,
                backgroundColor: hsl(bulletColor, colorScheme),
              }}
            />
          )}
          {typeof item === "string" ? (
            <Typography className={textClassName}>{item}</Typography>
          ) : (
            <View className="w-[95%]">{item}</View>
          )}
        </View>
      ))}
    </View>
  );
};
