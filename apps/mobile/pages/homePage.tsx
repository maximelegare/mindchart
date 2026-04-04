import * as React from "react";
import { NoteCreationFeature } from "@/features/noteCreation/views";
import { PageContainer } from "@/components/layout/page/pageContainer";

export const HomeScreen = () => {
  return (
    <PageContainer
      headerVariant="stack"
      title="Home"
      moreOptionsMenuLinks={[
        { label: "Settings", icon: "settings", href: "/settings" },
      ]}
    >
      <NoteCreationFeature />
    </PageContainer>
  );
};
