import * as React from "react";
import { PageContainer } from "@/components/layout/page/pageContainer";

import { AboutAppFeature } from "@/features/settings/features/aboutApp/views";

export const AboutAppPage = () => {
  return (
    <PageContainer
      headerVariant="tab"
      title="About App"
      subtitle={{ text: "Settings", icon: "settings" }}
    >
      <AboutAppFeature />
    </PageContainer>
  );
};
