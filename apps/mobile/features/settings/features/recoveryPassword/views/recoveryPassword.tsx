import { ScrollView } from "react-native";
import { CustomSettingComponent } from "@/features/settings/components/customSettingComponent";
import { EnableRecoveryPassword } from "../components/enableRecoveryPassword";
import { RecoveryPassphraseReveal } from "../components/recoveryPassphraseReveal";

export const RecoveryPasswordFeature = () => {
  return (
    <ScrollView contentContainerStyle={{ gap: 12, paddingBottom: 24 }}>
      <EnableRecoveryPassword />

      <CustomSettingComponent
        title="Recovery Passphrase"
        description="If you forget the export password, you can import using the recovery passphrase you chose. Reveal it here if you need a reminder."
      >
        <RecoveryPassphraseReveal />
      </CustomSettingComponent>
    </ScrollView>
  );
};
