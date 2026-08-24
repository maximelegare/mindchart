import { MoreOptionsMenuProps } from "@/components/layout/header/moreOptions/moreOptionsMenu";
import { PageContainer } from "@/components/layout/page/pageContainer";
import { OptionsBar } from "@/features/contentList/components/optionsBar/components/optionsBar";
import { ContentListFeature } from "@/features/contentList/views";
import { SearchFeature } from "@/features/search/views";
import { settingsPageTitleString } from "@/features/settings/settingsLabels";
import { useState } from "react";

export const NotesListPage = () => {
  const [open, setOpen] = useState(false);

  const moreOptionsMenuLinks: MoreOptionsMenuProps["links"] = [
    { label: settingsPageTitleString(), icon: "settings", href: "/settings" },
  ];

  return (
    <PageContainer
      showLogo={true}
      optionsHeader={<OptionsBar />}
      headerVariant="stack"
      collapsingHeader
      buttons={[<SearchFeature />]}
      moreOptionsMenu={{
        links: moreOptionsMenuLinks,
        state: { open, setOpen },
      }}
    >
      <ContentListFeature />
    </PageContainer>
  );
};
