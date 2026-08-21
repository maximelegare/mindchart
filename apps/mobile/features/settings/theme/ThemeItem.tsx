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
  value: ThemePreference;
  icon: React.ReactElement;
};

type ItemProps = {
  item: ItemData;
  onPress: () => void;
  selected: boolean;
};

function ThemeOptionTitle({ value }: { value: ThemePreference }) {
  switch (value) {
    case "system":
      return (
        <fbt desc="Theme option title: follow device settings">
          Device settings
        </fbt>
      );
    case "dark":
      return <fbt desc="Theme option title: dark mode">Dark mode</fbt>;
    case "light":
      return <fbt desc="Theme option title: light mode">Light mode</fbt>;
  }
}

function ThemeOptionSubtitle({ value }: { value: ThemePreference }) {
  switch (value) {
    case "system":
      return (
        <fbt desc="Theme option subtitle: follow device settings">
          Default to your device's appearance
        </fbt>
      );
    case "dark":
      return (
        <fbt desc="Theme option subtitle: dark mode">Always use Dark mode</fbt>
      );
    case "light":
      return (
        <fbt desc="Theme option subtitle: light mode">
          Always use Light mode
        </fbt>
      );
  }
}

function ThemePreferenceLabel({ value }: { value: ThemePreference }) {
  switch (value) {
    case "system":
      return <fbt desc="Selected theme label: system">System</fbt>;
    case "dark":
      return <fbt desc="Selected theme label: dark">Dark</fbt>;
    case "light":
      return <fbt desc="Selected theme label: light">Light</fbt>;
  }
}

function ThemeOption({ item, onPress, selected }: ItemProps) {
  return (
    <Pressable className="py-4" onPress={onPress}>
      <View className="flex flex-row justify-between">
        <View className="pr-4 pt-1">{item.icon}</View>
        <View className="flex-1">
          <H4>
            <ThemeOptionTitle value={item.value} />
          </H4>
          <Typography className="text-sm text-muted-foreground">
            <ThemeOptionSubtitle value={item.value} />
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
          key={theme.value}
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
        value: "system",
        icon: <Smartphone className="text-foreground" />,
      },
      {
        value: "dark",
        icon: <Moon className="text-foreground" />,
      },
      {
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
              <ThemePreferenceLabel value={themePreference} />
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
