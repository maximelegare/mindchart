import { useEffect } from "react";
import { useRouter } from "expo-router";
import { PageContainer } from "@/components/layout/page/pageContainer";
import { DatabaseRecoveryFeature } from "@/features/settings/features/workspaces/views/databaseRecovery";
import { isBiometricRecoveryEnabled } from "@/features/workspaces/keys/workspaceKeyManager";

export const DatabaseRecoveryPage = () => {
  const router = useRouter();

  useEffect(() => {
    if (!isBiometricRecoveryEnabled()) {
      router.replace("/settings/workspaces");
    }
  }, [router]);

  if (!isBiometricRecoveryEnabled()) {
    return null;
  }

  return (
    <PageContainer headerVariant="tab" title="Database key recovery">
      <DatabaseRecoveryFeature />
    </PageContainer>
  );
};
