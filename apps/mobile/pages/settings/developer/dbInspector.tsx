import * as React from "react";
import { PageContainer } from "@/components/layout/page/pageContainer";
import { DatabaseInspectorFeature } from "@/features/settings/features/developer/features/inspector/views";
import {
  settingsDbInspectorPageSubtitle,
  settingsDbInspectorPageTitle,
} from "@/features/settings/settingsLabels";

export const DatabaseInspectorPage = () => {
  return (
    <PageContainer
      headerVariant="tab"
      title={settingsDbInspectorPageTitle()}
      subtitle={{ text: settingsDbInspectorPageSubtitle(), icon: "settings" }}
    >
      <DatabaseInspectorFeature />
    </PageContainer>
  );
};
