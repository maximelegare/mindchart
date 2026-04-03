import React, { useState } from "react";
import Animated, { FadeInUp, FadeOutDown } from "react-native-reanimated";
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

export type MoreOptionsMenuProps = {
  links?: {
    label: string;
    icon: IconName;
    href: Href;
  }[];
};

export function MoreOptionsMenu({ links }: MoreOptionsMenuProps) {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  if (!links || links.length === 0) return null;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="w-14 absolute right-0 -bottom-3"
        >
          <Icon name="ellipsis-vertical" size={24} color="background" />
        </Button>
      </DropdownMenuTrigger>

      <Animated.View
        entering={FadeInUp.duration(200)}
        exiting={FadeOutDown.duration(150)}
      >
        <DropdownMenuContent
          className="w-44 rounded-3xl -mt-[1px]"
          side="bottom"
          align="end"
        >
          <DropdownMenuGroup>
            {links?.map((link, index) => (
              <React.Fragment key={index}>
                <DropdownMenuItem
                  key={link.label}
                  onPress={() => router.push(link.href)}
                >
                  <Icon
                    name={link.icon}
                    size={20}
                    color="background"
                    style={{ marginRight: 3 }}
                  />
                  <Typography>{link.label}</Typography>
                </DropdownMenuItem>
                {index !== links.length - 1 && <DropdownMenuSeparator />}
              </React.Fragment>
            ))}
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </Animated.View>
    </DropdownMenu>
  );
}
