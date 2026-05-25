import { PageContainer } from "@/components/layout/page/pageContainer";
import { NotesListFeature } from "@/features/notes/notesList/views";
import { SearchFeature } from "@/features/search/views";
import { useState } from "react";

export const NotesListPage = () => {
  const [open, setOpen] = useState(false);
  return (
    <PageContainer
      headerVariant="stack"
      title="Notes"
      buttons={<SearchFeature />}
      moreOptionsMenu={{
        links: [{ label: "Settings", icon: "settings", href: "/settings" }],
        state: { open, setOpen },
      }}
    >
      <NotesListFeature />
    </PageContainer>
  );
};
