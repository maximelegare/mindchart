import { Pressable, View } from "react-native";
import { useCallback, useMemo, startTransition } from "react";
import { useBottomSheetModal } from "@gorhom/bottom-sheet";
import { useLocaleContext } from "fbtee";

import { H4 } from "@/components/ui/typography";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetOpenTrigger,
  BottomSheetView,
} from "@/components/primitives/bottomSheet/bottom-sheet.native";
import { Typography } from "@/components/ui/typography";
import ListItem from "@/components/ui/list-item";
import { Check } from "@/lib/icons/Check";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import {
  LANGUAGES,
  type LanguageCode,
} from "@/features/translations/constants/lang";
import {
  getLanguageLabel,
  setStoredLocalePreference,
} from "@/features/translations/lib/localePreference";

type LanguageOptionProps = {
  code: LanguageCode;
  label: string;
  onPress: () => void;
  selected: boolean;
};

function LanguageOption({
  code,
  label,
  onPress,
  selected,
}: LanguageOptionProps) {
  return (
    <Pressable className="py-4" onPress={onPress}>
      <View className="flex flex-row justify-between">
        <View className="flex-1">
          <H4>{label}</H4>
          <Typography className="text-sm text-muted-foreground">
            {code}
          </Typography>
        </View>
        <View>{selected && <Check className="text-primary" />}</View>
      </View>
    </Pressable>
  );
}

function LanguagePickerBody({
  selected,
  onSelect,
}: {
  selected: LanguageCode;
  onSelect: (value: LanguageCode) => void;
}) {
  const { dismiss } = useBottomSheetModal();

  const languages = useMemo(
    () =>
      Array.from(LANGUAGES.entries()).map(([code, label]) => ({
        code: code as LanguageCode,
        label,
      })),
    []
  );

  return (
    <BottomSheetView className="gap-5 pt-6 bg-background px-4 pb-6">
      {languages.map((language) => (
        <LanguageOption
          key={language.code}
          code={language.code}
          label={language.label}
          onPress={() => {
            onSelect(language.code);
            dismiss();
          }}
          selected={language.code === selected}
        />
      ))}
    </BottomSheetView>
  );
}

export function LanguagesSheetRow({
  className,
  surface,
}: {
  className?: string;
  surface?: "card" | "none";
}) {
  const { colorScheme } = useColorScheme();
  const { locale, setLocale } = useLocaleContext();

  const selected = locale as LanguageCode;

  const onSelect = useCallback(
    (value: LanguageCode) => {
      setStoredLocalePreference(value);
      startTransition(() => {
        setLocale(value);
      });
    },
    [setLocale]
  );

  return (
    <BottomSheet>
      <BottomSheetOpenTrigger asChild>
        <ListItem
          className={className}
          surface={surface}
          label="Language"
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
              {getLanguageLabel(selected)}
            </Typography>
          )}
        />
      </BottomSheetOpenTrigger>
      <BottomSheetContent
        backgroundStyle={{ backgroundColor: hsl("background", colorScheme) }}
      >
        <BottomSheetHeader className="bg-background">
          <Typography variant="h3" padding={false}>
            Select language
          </Typography>
        </BottomSheetHeader>
        <LanguagePickerBody selected={selected} onSelect={onSelect} />
      </BottomSheetContent>
    </BottomSheet>
  );
}
