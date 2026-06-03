import { useEffect, useState } from "react";
import { PageContainer } from "@/components/layout/page/pageContainer";
import { DatabaseRecoveryFeature } from "@/features/settings/features/recoveryKeys/views/databaseRecovery";
import { useSecuritySettingsPreferences } from "@/features/settings/context/security";

export const DatabaseRecoveryPage = () => {
  const [persistReady, setPersistReady] = useState(() =>
    useSecuritySettingsPreferences.persist.hasHydrated()
  );

  useEffect(() => {
    if (persistReady) return;
    return useSecuritySettingsPreferences.persist.onFinishHydration(() => {
      setPersistReady(true);
    });
  }, [persistReady]);

  return (
    <PageContainer headerVariant="tab" title="Recovery Keys">
      <DatabaseRecoveryFeature />
    </PageContainer>
  );
};
