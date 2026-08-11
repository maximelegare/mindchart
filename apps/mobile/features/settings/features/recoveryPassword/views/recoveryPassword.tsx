import { View } from "react-native";
import { CustomSettingComponent } from "@/features/settings/components/customSettingComponent";
import { EnableRecoveryPassword } from "../components/enableRecoveryPassword";
import { RecoveryPassphraseReveal } from "../components/recoveryPassphraseReveal";

/** Recovery password UI (no scroll wrapper — parent page/sheet scrolls). */
export const RecoveryPasswordFeature = () => {
  return (
    <View style={{ gap: 12 }}>
      <EnableRecoveryPassword />

      <CustomSettingComponent
        title="Recovery Passphrase"
        description="If you forget the export password, you can import using the recovery passphrase you chose. Reveal it here if you need a reminder."
      >
        <RecoveryPassphraseReveal />
      </CustomSettingComponent>
    </View>
  );
};
