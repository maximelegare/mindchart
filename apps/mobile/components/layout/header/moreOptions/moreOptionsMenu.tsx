import React from "react";
import { TouchableOpacity, View } from "react-native";
import { useRouter, Href } from "expo-router";

// Reanimated
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
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

export type MoreOptionsMenuProps = {
  links: MoreOptionsMenuLink[];
  state: { open: boolean; setOpen: (open: boolean) => void };
};

export function MoreOptionsMenu({
  links,
  state: { open, setOpen },
}: MoreOptionsMenuProps) {
  const router = useRouter();

  // Shared value to control visibility on the UI thread
  const menuOpacity = useSharedValue(1);

  // Animated style applied to the inner container
  const animatedMenuOpacity = useAnimatedStyle(() => ({
    opacity: menuOpacity.value,
  }));

  const CustomEntering = () => {
    "worklet";
    return {
      initialValues: {
        transform: [{ translateY: -30 }],
        opacity: 0,
      },
      animations: {
        transform: [
          {
            translateY: withSpring(-5, {
              damping: 12,
              stiffness: 250,
              mass: 0.6,
            }),
          },
        ],
        opacity: withTiming(1, { duration: 100 }),
      },
    };
  };

  const CustomExiting = () => {
    "worklet";
    return {
      initialValues: {
        opacity: 0,
      },
      animations: {
        opacity: withTiming(0, { duration: 100 }),
      },
    };
  };
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

  if (!links || links.length === 0) return null;

  return (
    <DropdownMenu
      open={open}
      onOpenChange={handleOpenChange}
      className="relative"
    >
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="w-14">
          <WorkspaceAvatar />
        </Button>
      </DropdownMenuTrigger>

      {open && (
        <DropdownMenuContent
          forceMount
          className="w-52 border-none bg-transparent shadow-none top-[-5px] absolute"
          side="bottom"
          align="end"
        >
          <Animated.View style={[{ flex: 1 }, animatedMenuOpacity]}>
            <View style={{ paddingTop: 3 }}>
              <Animated.View
                entering={CustomEntering}
                exiting={CustomExiting}
                className="bg-popover rounded-3xl border border-border"
              >
                <DropdownMenuGroup className="overflow-hidden w-full">
                  <CurrentWorkspace />
                  <DropdownMenuSeparator className="my-0" />
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
                              <Icon
                                size={17}
                                name={link.icon}
                                color="background"
                              />
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
                                  <Typography variant="h3">
                                    {link.label}
                                  </Typography>
                                </View>
                              </BottomSheetHeader>

                              {link.component}
                            </BottomSheetView>
                          </BottomSheetContent>
                        </BottomSheet>
                        // </DropdownMenuItem>
                      )}
                      {index !== links.length - 1 && <DropdownMenuSeparator />}
                    </React.Fragment>
                  ))}
                </DropdownMenuGroup>
              </Animated.View>
            </View>
          </Animated.View>
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
}
