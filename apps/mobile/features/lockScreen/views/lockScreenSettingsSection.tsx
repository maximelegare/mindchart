import { useCallback, useEffect, useState } from "react";
import { View } from "react-native";
import ListItem from "@/components/ui/list-item";
import { Typography } from "@/components/ui/typography";
import { Icon } from "@/components/ui/icons/icon";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetOpenTrigger,
  BottomSheetView,
} from "@/components/primitives/bottomSheet/bottom-sheet.native";
import { SettingsSection } from "@/features/settings/components/settingsSection";
import { SettingsSheetRow } from "@/features/settings/components/settingsSheetRow";
import { useSecuritySettingsPreferences } from "@/features/settings/context/security";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { LOCK_SCREEN_MODE_LABELS } from "@/features/lockScreen/types";
import { useLockScreenSettingsUi } from "@/features/lockScreen/context/lockScreenSettingsUiContext";
import { LockScreenSettingsFeature } from "@/features/lockScreen/views/lockScreenSettingsFeature";
import { LockScreenPinSetupFeature } from "@/features/lockScreen/views/lockScreenPinSetupFeature";
import { hasAppPin } from "@/features/lockScreen/services/passcodeService";

function CustomPinSheetRow() {
  const { colorScheme } = useColorScheme();
  const lockScreenMode = useSecuritySettingsPreferences(
    (s) => s.lockScreenMode
  );
  const { pinSheetRef } = useLockScreenSettingsUi();
  const [pinConfigured, setPinConfigured] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const refreshPinStatus = useCallback(async () => {
    setPinConfigured(await hasAppPin());
  }, []);

  useEffect(() => {
    void refreshPinStatus();
  }, [refreshPinStatus]);

  const status =
    lockScreenMode === "customPin" && pinConfigured
      ? "Active"
      : pinConfigured
        ? "Configured"
        : "Not set";

  const needsAttention = status === "Not set";

  return (
    <BottomSheet>
      <BottomSheetOpenTrigger asChild>
        <ListItem
          surface="card"
          label="Custom PIN"
          borderBottom={false}
          noChevron
          description={
            <Typography
              variant="small"
              style={{ color: hsl("muted-foreground", colorScheme) }}
            >
              Set up or manage your 6-digit PIN
            </Typography>
          }
          itemRight={() => (
            <View className="flex-row items-center gap-1.5">
              <Typography
                variant="small"
                style={{
                  color:
                    status === "Not set"
                      ? hsl("foreground-errors", colorScheme)
                      : status === "Active"
                        ? hsl("primary", colorScheme)
                        : hsl("muted-foreground", colorScheme),
                }}
              >
                {status}
              </Typography>
              <Icon
                name="chevron-right"
                color={needsAttention ? "foreground-errors" : "primary"}
                size={20}
              />
            </View>
          )}
        />
      </BottomSheetOpenTrigger>
      <BottomSheetContent
        ref={pinSheetRef}
        enableDynamicSizing={false}
        snapPoints={["100%"]}
        backgroundStyle={{ backgroundColor: hsl("background", colorScheme) }}
        onChange={(index) => {
          const open = index >= 0;
          setIsSheetOpen(open);
          if (open) {
            void refreshPinStatus();
          }
        }}
      >
        <BottomSheetHeader className="bg-background">
          <Typography variant="h3" padding={false}>
            Custom PIN
          </Typography>
        </BottomSheetHeader>
        <BottomSheetView
          className="bg-background px-4"
          style={{ minHeight: 520 }}
        >
          <LockScreenPinSetupFeature
            isActive={isSheetOpen}
            initialHasPin={pinConfigured}
            onPinConfigured={refreshPinStatus}
          />
        </BottomSheetView>
      </BottomSheetContent>
    </BottomSheet>
  );
}

function LockScreenSettingsSectionContent() {
  const lockScreenMode = useSecuritySettingsPreferences(
    (s) => s.lockScreenMode
  );

  const lockScreenStatus =
    lockScreenMode === "customPin"
      ? LOCK_SCREEN_MODE_LABELS.customPin
      : LOCK_SCREEN_MODE_LABELS[lockScreenMode];

  return (
    <SettingsSection title="Lock screen" icon="lock-keyhole">
      <SettingsSheetRow
        label="Lock screen"
        status={lockScreenStatus}
        sheetTitle="Lock screen"
        snapPoints={["100%"]}
        borderBottom
        dangerChevron={lockScreenMode === "off"}
      >
        <LockScreenSettingsFeature />
      </SettingsSheetRow>
      <CustomPinSheetRow />
    </SettingsSection>
  );
}

export function LockScreenSettingsSection() {
  return <LockScreenSettingsSectionContent />;
}
