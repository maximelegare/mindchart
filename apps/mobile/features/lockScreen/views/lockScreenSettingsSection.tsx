import { useCallback, useEffect, useState } from "react";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetView,
} from "@/components/primitives/bottomSheet/bottom-sheet.native";
import { SettingsSection } from "@/features/settings/components/settingsSection";
import { SettingsSheetRow } from "@/features/settings/components/settingsSheetRow";
import { Typography } from "@/components/ui/typography";
import { useSecuritySettingsPreferences } from "@/features/settings/context/security";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { LOCK_SCREEN_MODE_LABELS } from "@/features/lockScreen/types";
import { useLockScreenSettingsUi } from "@/features/lockScreen/context/lockScreenSettingsUiContext";
import { LockScreenSettingsFeature } from "@/features/lockScreen/views/lockScreenSettingsFeature";
import { LockScreenPinSetupFeature } from "@/features/lockScreen/views/lockScreenPinSetupFeature";
import { hasAppPin } from "@/features/lockScreen/services/passcodeService";

function LockScreenPinSheet() {
  const { colorScheme } = useColorScheme();
  const { pinSheetRef } = useLockScreenSettingsUi();
  const [pinConfigured, setPinConfigured] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const refreshPinStatus = useCallback(async () => {
    setPinConfigured(await hasAppPin());
  }, []);

  useEffect(() => {
    void refreshPinStatus();
  }, [refreshPinStatus]);

  return (
    <BottomSheet>
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

export function LockScreenSettingsSection() {
  const lockScreenMode = useSecuritySettingsPreferences(
    (s) => s.lockScreenMode
  );
  const [pinConfigured, setPinConfigured] = useState(false);

  useEffect(() => {
    void hasAppPin().then(setPinConfigured);
  }, [lockScreenMode]);

  const lockScreenStatus =
    lockScreenMode === "customPin"
      ? LOCK_SCREEN_MODE_LABELS.customPin
      : LOCK_SCREEN_MODE_LABELS[lockScreenMode];

  const needsAttention =
    lockScreenMode === "off" ||
    (lockScreenMode === "customPin" && !pinConfigured);

  return (
    <>
      <SettingsSection title="Lock screen" icon="lock-keyhole">
        <SettingsSheetRow
          label="Lock screen"
          status={lockScreenStatus}
          sheetTitle="Lock screen"
          snapPoints={["100%"]}
          borderBottom={false}
          dangerChevron={needsAttention}
        >
          <LockScreenSettingsFeature />
        </SettingsSheetRow>
      </SettingsSection>

      <LockScreenPinSheet />
    </>
  );
}
