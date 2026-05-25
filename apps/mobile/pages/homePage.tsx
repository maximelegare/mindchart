import * as React from "react";
import { NoteCreationFeature } from "@/features/notes/noteCreation/views";
import { PageContainer } from "@/components/layout/page/pageContainer";
import { useState } from "react";
import { SearchFeature } from "@/features/search/views";

export const HomeScreen = () => {
  const [open, setOpen] = useState(false);
  return (
    <PageContainer
      headerVariant="stack"
      title="Home"
      buttons={<SearchFeature />}
      moreOptionsMenu={{
        links: [{ label: "Settings", icon: "settings", href: "/settings" }],
        state: { open, setOpen },
      }}
    >
      <NoteCreationFeature />
    </PageContainer>
  );
};
