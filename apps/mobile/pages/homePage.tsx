import * as React from "react";
import { NoteCreationFeature } from "@/features/notes/noteCreation/views";
import { PageContainer } from "@/components/layout/page/pageContainer";
import { useState } from "react";
import { SearchFeature } from "@/features/search/views";
import { MoreOptionsMenuProps } from "@/components/layout/header/moreOptions/moreOptionsMenu";
import { NoteCreationOptionsHeader } from "@/features/notes/noteCreation/components/noteCreationOptionsHeader";

export const HomeScreen = () => {
  const [open, setOpen] = useState(false);

  const moreOptionsMenuLinks: MoreOptionsMenuProps["links"] = [
    { label: "Manage Topics", icon: "tag", href: "/topics" },
    { label: "Settings", icon: "settings", href: "/settings" },
  ];

  return (
    <PageContainer
      showLogo={true}
      headerVariant="stack"
      noScrollView
      showFloatingButton
      buttons={<SearchFeature />}
      optionsHeader={<NoteCreationOptionsHeader />}
      moreOptionsMenu={{
        links: moreOptionsMenuLinks,
        state: { open, setOpen },
      }}
    >
      <NoteCreationFeature />
    </PageContainer>
  );
};
