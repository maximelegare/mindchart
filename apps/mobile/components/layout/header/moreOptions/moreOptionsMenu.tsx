import React, { useState } from "react";
import Animated, { SlideOutUp } from "react-native-reanimated";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icons/icon";
import { Typography } from "@/components/ui";
import { Href, useRouter } from "expo-router";
import { IconName } from "@/components/ui/icons/icon-registry";
import { View } from "react-native";
import { withSpring, withTiming } from "react-native-reanimated";

export type MoreOptionsMenuProps = {
  links?: {
    label: string;
    icon: IconName;
    href: Href;
  }[];
};

// ... other imports

export function MoreOptionsMenu({ links }: MoreOptionsMenuProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // Custom Snappy Entrance: Starts -20px up (hidden behind button) and slides to 0
  const CustomEntering = () => {
    "worklet";
    const animations = {
      transform: [
        {
          translateY: withSpring(-5, {
            damping: 12, // Lowered from 30 to allow a slight overshoot/bump
            stiffness: 250, // Increased for a faster, "snappier" drop
            mass: 0.6, // Lower mass makes it move faster and feel lighter
          }),
        },
      ],
      opacity: withTiming(1, { duration: 100 }),
    };
    const initialValues = {
      transform: [{ translateY: -30 }], // Start higher up to ensure it's hidden
      opacity: 0,
    };
    return { initialValues, animations };
  };

  if (!links || links.length === 0) return null;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} className="relative">
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="w-14 absolute right-0 -bottom-3"
        >
          <Icon name="ellipsis-vertical" size={24} color="background" />
        </Button>
      </DropdownMenuTrigger>

      {open && (
        <DropdownMenuContent
          forceMount
          className="w-44 border-none bg-transparent shadow-none top-[-5px] absolute"
          side="bottom"
          align="end" // Tucks the menu slightly "under" the button
        >
          {/* MASK: Keeps the animation "cut off" at the button line */}
          <View style={{ paddingTop: 5 }}>
            <Animated.View
              entering={CustomEntering}
              exiting={SlideOutUp.duration(200)}
              className="bg-popover rounded-3xl border border-border"
            >
              <DropdownMenuGroup>
                {links.map((link, index) => (
                  <React.Fragment key={link.label}>
                    <DropdownMenuItem
                      className="px-3 flex-row gap-3 items-center"
                      onPress={() => {
                        setOpen(false);
                        // Using a small delay to avoid the Android ViewTree crash
                        setTimeout(() => router.push(link.href), 100);
                      }}
                    >
                      <Icon name={link.icon} size={18} color="background" />
                      <Typography>{link.label}</Typography>
                    </DropdownMenuItem>
                    {index !== links.length - 1 && <DropdownMenuSeparator />}
                  </React.Fragment>
                ))}
              </DropdownMenuGroup>
            </Animated.View>
          </View>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}
