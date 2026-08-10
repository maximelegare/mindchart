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
import { Moon, Smartphone, Sun } from "@/lib/icons";

import ListItem from "@/components/ui/list-item";
import { Check } from "@/lib/icons/Check";
import { useCallback, useMemo } from "react";
import { useBottomSheetModal } from "@gorhom/bottom-sheet";
import { useColorScheme } from "@/lib/useColorScheme";
import type { ThemePreference } from "@/lib/themePreference";
import { resolveThemePreference } from "@/lib/themePreference";
import { setAndroidNavigationBar } from "@/lib/android-navigation-bar";
import { hsl } from "@/utils/hsl";

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

const THEME_LABELS: Record<ThemePreference, string> = {
  system: "System",
  dark: "Dark",
  light: "Light",
};

function ThemeOption({ item, onPress, selected }: ItemProps) {
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

function ThemePickerBody({
  themes,
  selected,
  onSelect,
}: {
  themes: ItemData[];
  selected: ThemePreference;
  onSelect: (value: ThemePreference) => void;
}) {
  const { dismiss } = useBottomSheetModal();

  return (
    <BottomSheetView className="gap-5 pt-6 bg-background px-4 pb-6">
      {themes.map((theme) => (
        <ThemeOption
          key={theme.title}
          item={theme}
          onPress={() => {
            onSelect(theme.value);
            dismiss();
          }}
          selected={theme.value === selected}
        />
      ))}
    </BottomSheetView>
  );
}

export const ThemeSettingItem = ({
  className,
  surface,
}: {
  className?: string;
  surface?: "card" | "none";
}) => {
  const { themePreference, setColorScheme, colorScheme } = useColorScheme();

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
    },
    [setColorScheme]
  );

  return (
    <BottomSheet>
      <BottomSheetOpenTrigger asChild>
        <ListItem
          className={className}
          surface={surface}
          label="Theme"
          borderBottom={false}
          itemRight={() => (
            <Typography
              variant="p"
              style={{
                fontSize: 14,
                color: hsl("muted-foreground", colorScheme),
                marginRight: 4,
              }}
            >
              {THEME_LABELS[themePreference]}
            </Typography>
          )}
        />
      </BottomSheetOpenTrigger>
      <BottomSheetContent
        backgroundStyle={{ backgroundColor: hsl("background", colorScheme) }}
      >
        <BottomSheetHeader className="bg-background">
          <Typography variant="h3" padding={false}>
            Select Theme
          </Typography>
        </BottomSheetHeader>
        <ThemePickerBody
          themes={themes}
          selected={themePreference}
          onSelect={onSelect}
        />
      </BottomSheetContent>
    </BottomSheet>
  );
};
