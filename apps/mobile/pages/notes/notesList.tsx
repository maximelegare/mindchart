import { MoreOptionsMenuProps } from "@/components/layout/header/moreOptions/moreOptionsMenu";
import { PageContainer } from "@/components/layout/page/pageContainer";
import { FolderTreeSidebar } from "@/features/contentList/components/folderTree/folderTreeSidebar";
import { OptionsBar } from "@/features/contentList/components/optionsBar/components/optionsBar";
import { ContentListFeature } from "@/features/contentList/views";
import { SearchFeature } from "@/features/search/views";
import { useState } from "react";
import { View } from "react-native";

export const NotesListPage = () => {
  const [open, setOpen] = useState(false);

  const moreOptionsMenuLinks: MoreOptionsMenuProps["links"] = [
    { label: "Manage Topics", icon: "tag", href: "/topics" },
    { label: "Settings", icon: "settings", href: "/settings" },
  ];

  return (
    <View className="flex-1">
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
      <FolderTreeSidebar />
    </View>
  );
};
