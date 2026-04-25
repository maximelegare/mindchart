import * as React from "react";
import { NoteCreationFeature } from "@/features/notes/noteCreation/views";
import { PageContainer } from "@/components/layout/page/pageContainer";
import { useState } from "react";

export const HomeScreen = () => {
  const [open, setOpen] = useState(false);
  return (
    <PageContainer
      headerVariant="stack"
      title="Home"
      moreOptionsMenu={{
        links: [{ label: "Settings", icon: "settings", href: "/settings" }],
        state: { open, setOpen },
      }}
    >
      <NoteCreationFeature />
    </PageContainer>
  );
};
