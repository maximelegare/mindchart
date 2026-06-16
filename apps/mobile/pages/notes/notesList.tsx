import { MoreOptionsMenuProps } from "@/components/layout/header/moreOptions/moreOptionsMenu";
import { PageContainer } from "@/components/layout/page/pageContainer";
import { ContentListFeature } from "@/features/notes/contentList/views";
import { SearchFeature } from "@/features/search/views";
import { useState } from "react";

export const NotesListPage = () => {
  const [open, setOpen] = useState(false);

  const moreOptionsMenuLinks: MoreOptionsMenuProps["links"] = [
    { label: "Manage Topics", icon: "tag", href: "/topics" },
    { label: "Settings", icon: "settings", href: "/settings" },
  ];

  return (
    <PageContainer
      headerVariant="stack"
      title="Notes"
      buttons={<SearchFeature />}
      moreOptionsMenu={{
        links: moreOptionsMenuLinks,
        state: { open, setOpen },
      }}
    >
      <ContentListFeature />
    </PageContainer>
  );
};
