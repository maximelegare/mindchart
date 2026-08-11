import * as React from "react";
import { PageContainer } from "@/components/layout/page/pageContainer";

import { SettingsFeature } from "@/features/settings/views";
import { PageOptionsHeaderContainer } from "@/components/layout/page/pageOptionsHeaderContainer";

export const SettingsPage = () => {
  return (
    <PageContainer
      optionsHeader={<PageOptionsHeaderContainer></PageOptionsHeaderContainer>}
      collapsingHeader
      headerVariant="tab"
      title="Settings"
      pageTopRadius={36}
    >
      <SettingsFeature />
    </PageContainer>
  );
};
