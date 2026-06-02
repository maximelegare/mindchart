import { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { PageContainer } from "@/components/layout/page/pageContainer";
import { DatabaseRecoveryFeature } from "@/features/settings/features/workspaces/views/databaseRecovery";
import { useSecuritySettingsPreferences } from "@/features/settings/context/security";

export const DatabaseRecoveryPage = () => {
  const router = useRouter();
  const biometricRecoveryEnabled = useSecuritySettingsPreferences(
    (s) => s.biometricRecoveryEnabled
  );
  const [persistReady, setPersistReady] = useState(() =>
    useSecuritySettingsPreferences.persist.hasHydrated()
  );

  useEffect(() => {
    if (persistReady) return;
    return useSecuritySettingsPreferences.persist.onFinishHydration(() => {
      setPersistReady(true);
    });
  }, [persistReady]);

  useEffect(() => {
    if (!persistReady) return;
    if (!biometricRecoveryEnabled) {
      router.replace("/settings/workspaces");
    }
  }, [persistReady, biometricRecoveryEnabled, router]);

  if (!persistReady || !biometricRecoveryEnabled) {
    return null;
  }

  return (
    <PageContainer headerVariant="tab" title="Recovery Keys">
      <DatabaseRecoveryFeature />
    </PageContainer>
  );
};
