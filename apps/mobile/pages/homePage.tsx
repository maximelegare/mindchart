import * as React from "react";
import { NoteCreationFeature } from "@/features/notes/noteCreation/views";
import { PageContainer } from "@/components/layout/page/pageContainer";
import { useState } from "react";
import { SearchFeature } from "@/features/search/views";
import { MoreOptionsMenuProps } from "@/components/layout/header/moreOptions/moreOptionsMenu";
import { NoteCreationProvider } from "@/features/notes/noteCreation/context/noteCreationContext";
import { NoteCreationOptionsHeader } from "@/features/notes/noteCreation/components/noteCreationOptionsHeader";

export const HomeScreen = () => {
  const [open, setOpen] = useState(false);

  const moreOptionsMenuLinks: MoreOptionsMenuProps["links"] = [
    { label: "Manage Topics", icon: "tag", href: "/topics" },
    { label: "Settings", icon: "settings", href: "/settings" },
  ];

  return (
    <NoteCreationProvider>
      <PageContainer
        showLogo={true}
        headerVariant="stack"
        noScrollView
        buttons={<SearchFeature />}
        optionsHeader={<NoteCreationOptionsHeader />}
        moreOptionsMenu={{
          links: moreOptionsMenuLinks,
          state: { open, setOpen },
        }}
      >
        <NoteCreationFeature />
      </PageContainer>
    </NoteCreationProvider>
  );
};
