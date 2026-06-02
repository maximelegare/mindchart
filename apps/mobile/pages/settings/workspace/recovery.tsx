import { useEffect } from "react";
import { useRouter } from "expo-router";
import { PageContainer } from "@/components/layout/page/pageContainer";
import { DatabaseRecoveryFeature } from "@/features/settings/features/workspaces/views/databaseRecovery";
import { useSecuritySettingsPreferences } from "@/features/settings/context/security";

export const DatabaseRecoveryPage = () => {
  const router = useRouter();
  const biometricRecoveryEnabled = useSecuritySettingsPreferences(
    (s) => s.biometricRecoveryEnabled
  );

  useEffect(() => {
    if (!biometricRecoveryEnabled) {
      router.replace("/settings/workspaces");
    }
  }, [biometricRecoveryEnabled, router]);

  if (!biometricRecoveryEnabled) {
    return null;
  }

  return (
    <PageContainer headerVariant="tab" title="Recovery Keys">
      <DatabaseRecoveryFeature />
    </PageContainer>
  );
};
