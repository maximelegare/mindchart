import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Icon } from "@/components/ui/icons/icon";
import { hsl } from "@/utils/hsl";
import { Typography } from "@/components/ui";
import { push } from "expo-router/build/global-state/routing";

export function MoreOptionsMenu() {
  const [open, setOpen] = useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          style={{ backgroundColor: hsl("popover", "theme", "light", -70) }}
          // We override native defaults here to ensure it sits flush
          className="h-full w-14 rounded-none native:h-full native:w-14 native:px-0 native:py-0"
        >
          <Icon name="ellipsis-vertical" size={24} color="background" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-44 rounded-2xl" side="top" align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem onPress={() => push("/settings")}>
            <Icon name="settings" size={24} color="background" />
            <Typography>Settings</Typography>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
