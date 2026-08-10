import { Pressable, View } from "react-native";

import { H4 } from "@/components/ui/typography";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetOpenTrigger,
  BottomSheetView,
} from "@/components/primitives/bottomSheet/bottom-sheet.native";
import { Typography } from "@/components/ui/typography";
import { Moon, Palette, Smartphone, Sun } from "@/lib/icons";

import ListItem from "@/components/ui/list-item";
import { Check } from "@/lib/icons/Check";
import { useCallback, useMemo } from "react";
import { useBottomSheetModal } from "@gorhom/bottom-sheet";
import { useColorScheme } from "@/lib/useColorScheme";
import type { ThemePreference } from "@/lib/themePreference";
import { resolveThemePreference } from "@/lib/themePreference";
import { setAndroidNavigationBar } from "@/lib/android-navigation-bar";

type ItemData = {
  title: string;
  subtitle: string;
  value: ThemePreference;
  icon: React.ReactElement;
};

type ItemProps = {
  item: ItemData;
  onPress: () => void;
  selected: boolean;
};

function ThemeItem({ item, onPress, selected }: ItemProps) {
  return (
    <Pressable className="py-4" onPress={onPress}>
      <View className="flex flex-row justify-between">
        <View className="pr-4 pt-1">{item.icon}</View>
        <View className="flex-1">
          <H4>{item.title}</H4>
          <Typography className="text-sm text-muted-foreground">
            {item.subtitle}
          </Typography>
        </View>
        <View>{selected && <Check className="text-primary" />}</View>
      </View>
    </Pressable>
  );
}

export const ThemeSettingItem = () => {
  const { themePreference, setColorScheme } = useColorScheme();
  const { dismiss } = useBottomSheetModal();

  const themes: ItemData[] = useMemo(
    () => [
      {
        title: "Device settings",
        subtitle: "Default to your device's appearance",
        value: "system",
        icon: <Smartphone className="text-foreground" />,
      },
      {
        title: "Dark mode",
        subtitle: "Always use Dark mode",
        value: "dark",
        icon: <Moon className="text-foreground" />,
      },
      {
        title: "Light mode",
        subtitle: "Always use Light mode",
        value: "light",
        icon: <Sun className="text-foreground" />,
      },
    ],
    []
  );

  const onSelect = useCallback(
    (value: ThemePreference) => {
      setColorScheme(value);
      setAndroidNavigationBar(resolveThemePreference(value));
      dismiss();
    },
    [dismiss, setColorScheme]
  );

  return (
    <BottomSheet>
      <BottomSheetOpenTrigger asChild>
        <ListItem
          className="bg-background"
          itemLeft={(props) => <Palette {...props} />}
          label="Theme"
        />
      </BottomSheetOpenTrigger>
      <BottomSheetContent>
        <BottomSheetHeader className="bg-background">
          <Typography className="text-foreground text-xl font-bold  pb-1">
            Select Theme
          </Typography>
        </BottomSheetHeader>
        <BottomSheetView className="gap-5 pt-6 bg-background">
          {themes.map((theme) => (
            <ThemeItem
              key={theme.title}
              item={theme}
              onPress={() => onSelect(theme.value)}
              selected={theme.value === themePreference}
            />
          ))}
        </BottomSheetView>
      </BottomSheetContent>
    </BottomSheet>
  );
};
