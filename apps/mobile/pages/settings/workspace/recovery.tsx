import { useEffect, useState } from "react";
import { PageContainer } from "@/components/layout/page/pageContainer";
import { RecoveryPasswordFeature } from "@/features/settings/features/recoveryPassword/views/recoveryPassword";
import { useSecuritySettingsPreferences } from "@/features/settings/context/security";

export const RecoveryPasswordPage = () => {
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
    <PageContainer headerVariant="tab" title="Recovery Password">
      <RecoveryPasswordFeature />
    </PageContainer>
  );
};
