import * as React from "react";
import { PageContainer } from "@/components/layout/page/pageContainer";

import { SettingsFeature } from "@/features/settings/views";
import { PageOptionsHeaderContainer } from "@/components/layout/page/pageOptionsHeaderContainer";
import { settingsPageTitleString } from "@/features/settings/settingsLabels";

export const SettingsPage = () => {
  return (
    <PageContainer
      optionsHeader={<PageOptionsHeaderContainer></PageOptionsHeaderContainer>}
      collapsingHeader
      headerVariant="tab"
      title={settingsPageTitleString()}
      pageTopRadius={36}
    >
      <SettingsFeature />
    </PageContainer>
  );
};
