import * as React from "react";
import { PageContainer } from "@/components/layout/page/pageContainer";
import { DeveloperSettingsFeature } from "@/features/settings/features/developer/views";
import {
  settingsDeveloperOptionsPageTitle,
  settingsDeveloperPageSubtitle,
} from "@/features/settings/settingsLabels";

export const DeveloperSettingsPage = () => {
  return (
    <PageContainer
      headerVariant="tab"
      title={settingsDeveloperOptionsPageTitle()}
      subtitle={{ text: settingsDeveloperPageSubtitle(), icon: "settings" }}
    >
      <DeveloperSettingsFeature />
    </PageContainer>
  );
};
