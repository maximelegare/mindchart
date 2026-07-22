import React from "react";
import { TouchableOpacity, View } from "react-native";
import { useRouter, Href } from "expo-router";

// Reanimated
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from "react-native-reanimated";

// Local UI Components
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

// Primitives & Types
import { IconName } from "@/components/ui/icons/icon-registry";
import {
  BottomSheet,
  BottomSheetHeader,
  BottomSheetContent,
  BottomSheetOpenTrigger,
  BottomSheetView,
} from "@/components/primitives/bottomSheet/bottom-sheet.native";
import { WorkspaceAvatar } from "@/features/workspaces/components/manageWorkspaces/workspaceAvatar";
import { CurrentWorkspace } from "./currentWorkspace";

// --- Types ---

type MoreOptionsMenuLinkBase = {
  label: string;
  icon: IconName;
};

type MoreOptionsMenuHrefLink = MoreOptionsMenuLinkBase & {
  href: Href;
  component?: never;
  action?: never;
};

type MoreOptionsMenuComponentLink = MoreOptionsMenuLinkBase & {
  component: React.ReactNode;
  href?: never;
  action?: never;
};

type MoreOptionsMenuActionLink = MoreOptionsMenuLinkBase & {
  action: () => void;
  href?: never;
  component?: never;
};

export type MoreOptionsMenuLink =
  | MoreOptionsMenuHrefLink
  | MoreOptionsMenuComponentLink
  | MoreOptionsMenuActionLink;

/** Icon trigger, or the workspace avatar logo. */
export type MoreOptionsMenuTrigger = IconName | "currentWorkspace";

export type MoreOptionsMenuProps = {
  links: MoreOptionsMenuLink[];
  state: { open: boolean; setOpen: (open: boolean) => void };
  /**
   * Header trigger content.
   * - `IconName`: show that icon
   * - `"currentWorkspace"` / omitted: show the workspace avatar
   */
  trigger?: MoreOptionsMenuTrigger;
  /** Show the current workspace switcher at the top of the menu. Defaults to true. */
  currentWorkspace?: boolean;
};

export function MoreOptionsMenu({
  links,
  state: { open, setOpen },
  trigger = "currentWorkspace",
  currentWorkspace = true,
}: MoreOptionsMenuProps) {
  const router = useRouter();

  // Shared value to control visibility on the UI thread
  const menuOpacity = useSharedValue(1);

  // Animated style applied to the inner container
  const animatedMenuOpacity = useAnimatedStyle(() => ({
    opacity: menuOpacity.value,
  }));

  /**
   * Orchestrates the fade out before updating state or navigating.
   */
  const dismissWithAnimation = (action?: () => void) => {
    menuOpacity.value = withTiming(
      0,
      {
        duration: 150,
        easing: Easing.out(Easing.quad),
      },
      (finished) => {
        if (finished) {
          if (action) {
            runOnJS(action)();
          }
          runOnJS(setOpen)(false);
        }
      }
    );
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      // Reset opacity immediately when opening
      menuOpacity.value = 1;
      setOpen(true);
    } else {
      // Handles clicking outside (backdrop dismiss)
      dismissWithAnimation();
    }
  };

  const hasLinks = links != null && links.length > 0;
  if (!hasLinks && !currentWorkspace) return null;

  const showWorkspaceTrigger = trigger === "currentWorkspace";

  return (
    <DropdownMenu
      open={open}
      onOpenChange={handleOpenChange}
      className="relative"
    >
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="mr-1">
          {showWorkspaceTrigger ? (
            <WorkspaceAvatar />
          ) : (
            <Icon name={trigger} size={26} color="background" />
          )}
        </Button>
      </DropdownMenuTrigger>

      {open && (
        <DropdownMenuContent
          forceMount
          className="w-52 mt-[6px] rounded-3xl border border-border bg-popover pb-0"
          side="bottom"
          align="end"
        >
          <Animated.View style={[{ flex: 1 }, animatedMenuOpacity]}>
            <DropdownMenuGroup className="overflow-hidden w-full">
              {currentWorkspace ? (
                <>
                  <CurrentWorkspace />
                  {hasLinks ? <DropdownMenuSeparator className="my-0" /> : null}
                </>
              ) : null}
              {links.map((link, index) => (
                <React.Fragment key={link.label}>
                  {link.href !== undefined ? (
                    <DropdownMenuItem
                      className="px-3 flex-row gap-3 items-center"
                      onPress={() => {
                        setTimeout(() => {
                          router.push(link.href as Href);
                        }, 150);
                      }}
                    >
                      <Icon name={link.icon} size={18} color="background" />
                      <Typography
                        variant="h4"
                        className="text-popover-foreground"
                      >
                        {link.label}
                      </Typography>
                    </DropdownMenuItem>
                  ) : link.action !== undefined ? (
                    <DropdownMenuItem
                      className="px-3 w-full"
                      onPress={link.action}
                    >
                      <Icon name={link.icon} size={18} color="background" />
                      <Typography
                        variant="h4"
                        className="text-popover-foreground"
                      >
                        {link.label}
                      </Typography>
                    </DropdownMenuItem>
                  ) : (
                    <BottomSheet>
                      <BottomSheetOpenTrigger
                        asChild
                        className="relative flex flex-row web:cursor-default gap-2 items-center rounded-sm px-3 py-1.5 native:py-2 web:outline-none web:focus:bg-accent active:bg-accent web:hover:bg-accent group"
                      >
                        <TouchableOpacity
                          className="flex-row flex-1 items-center gap-3 w-full"
                          onPress={() => {
                            // Fade out the menu as the sheet slides up
                            menuOpacity.value = withTiming(0, {
                              duration: 150,
                            });
                          }}
                        >
                          <Icon size={17} name={link.icon} color="background" />
                          <Typography
                            variant="h4"
                            className="text-popover-foreground"
                          >
                            {link.label}
                          </Typography>
                        </TouchableOpacity>
                      </BottomSheetOpenTrigger>

                      <BottomSheetContent
                        snapPoints={["100%"]}
                        index={0}
                        enableContentPanningGesture={false}
                        enablePanDownToClose={false}
                      >
                        <BottomSheetView className="flex-1 gap-5 pt-6 bg-background h-full">
                          <BottomSheetHeader
                            className="bg-background gap-2"
                            onDismiss={() => setOpen(false)}
                          >
                            <View className="flex-row justify-start items-center gap-2">
                              <Icon name={link.icon} color="foreground" />
                              <Typography variant="h3">{link.label}</Typography>
                            </View>
                          </BottomSheetHeader>

                          {link.component}
                        </BottomSheetView>
                      </BottomSheetContent>
                    </BottomSheet>
                  )}
                  {index !== links.length - 1 && <DropdownMenuSeparator />}
                </React.Fragment>
              ))}
            </DropdownMenuGroup>
          </Animated.View>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}
