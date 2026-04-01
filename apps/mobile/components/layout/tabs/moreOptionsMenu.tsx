import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Text } from "react-native";
import { useState } from "react";
import { Icon } from "@/components/ui/icons/icon";
import { hsl } from "@/utils/hsl";

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

      <DropdownMenuContent className="w-56" side="top" align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Text>Profile</Text>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Text>Settings</Text>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
