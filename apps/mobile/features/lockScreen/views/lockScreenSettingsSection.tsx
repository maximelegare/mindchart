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
import { useLockScreenSettingsUi } from "@/features/lockScreen/context/lockScreenSettingsUiContext";
import { LockScreenSettingsFeature } from "@/features/lockScreen/views/lockScreenSettingsFeature";
import { LockScreenPinSetupFeature } from "@/features/lockScreen/views/lockScreenPinSetupFeature";
import { hasAppPin } from "@/features/lockScreen/services/passcodeService";
import {
  SettingsCustomPinSheetTitle,
  SettingsLockScreenSectionTitle,
  getLockScreenModeLabel,
  settingsLockScreenRowLabel,
} from "@/features/lockScreen/lockScreenLabels";

function LockScreenPinSheet({
  onPinConfigured,
}: {
  onPinConfigured: () => void;
}) {
  const { colorScheme } = useColorScheme();
  const { pinSheetRef, pinSheetSession, clearPinSheetSession } =
    useLockScreenSettingsUi();

  return (
    <BottomSheet>
      <BottomSheetContent
        ref={pinSheetRef}
        enableDynamicSizing={false}
        snapPoints={["100%"]}
        backgroundStyle={{ backgroundColor: hsl("background", colorScheme) }}
        onChange={(index) => {
          if (index < 0) {
            clearPinSheetSession();
          }
        }}
      >
        <BottomSheetHeader className="bg-background">
          <Typography variant="h3" padding={false}>
            <SettingsCustomPinSheetTitle />
          </Typography>
        </BottomSheetHeader>
        <BottomSheetView
          className="bg-background px-4"
          style={{ minHeight: 520 }}
        >
          {pinSheetSession ? (
            <LockScreenPinSetupFeature
              key={pinSheetSession.sessionId}
              session={pinSheetSession}
              onPinConfigured={onPinConfigured}
            />
          ) : null}
        </BottomSheetView>
      </BottomSheetContent>
    </BottomSheet>
  );
}

export function LockScreenSettingsSection() {
  const lockScreenMode = useSecuritySettingsPreferences(
    (s) => s.lockScreenMode
  );
  const { pinSheetSession } = useLockScreenSettingsUi();
  const [pinConfigured, setPinConfigured] = useState(false);

  const refreshPinStatus = useCallback(async () => {
    setPinConfigured(await hasAppPin());
  }, []);

  useEffect(() => {
    void refreshPinStatus();
  }, [lockScreenMode, pinSheetSession, refreshPinStatus]);

  const lockScreenStatus = getLockScreenModeLabel(lockScreenMode);

  const needsAttention =
    lockScreenMode === "off" ||
    (lockScreenMode === "customPin" && !pinConfigured);

  return (
    <>
      <SettingsSection
        title={<SettingsLockScreenSectionTitle />}
        icon="lock-keyhole"
      >
        <SettingsSheetRow
          label={settingsLockScreenRowLabel()}
          status={lockScreenStatus}
          sheetTitle={settingsLockScreenRowLabel()}
          snapPoints={["100%"]}
          borderBottom={false}
          dangerChevron={needsAttention}
        >
          <LockScreenSettingsFeature onPinConfigured={refreshPinStatus} />
        </SettingsSheetRow>
      </SettingsSection>

      <LockScreenPinSheet onPinConfigured={refreshPinStatus} />
    </>
  );
}
