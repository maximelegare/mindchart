import * as React from "react";
import { NoteCreationFeature } from "@/features/notes/noteCreation/views";
import { PageContainer } from "@/components/layout/page/pageContainer";
import { useState } from "react";
import { SearchFeature } from "@/features/search/views";
import { MoreOptionsMenuProps } from "@/components/layout/header/moreOptions/moreOptionsMenu";

export const HomeScreen = () => {
  const [open, setOpen] = useState(false);

  const moreOptionsMenuLinks: MoreOptionsMenuProps["links"] = [
    { label: "Manage Topics", icon: "tag", href: "/topics" },
    { label: "Settings", icon: "settings", href: "/settings" },
  ];

  return (
    <PageContainer
      headerVariant="stack"
      title="Home"
      buttons={<SearchFeature />}
      moreOptionsMenu={{
        links: moreOptionsMenuLinks,
        state: { open, setOpen },
      }}
    >
      <NoteCreationFeature />
    </PageContainer>
  );
};
