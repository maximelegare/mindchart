import { PageContainer } from "@/components/layout/page/pageContainer";
import { TopicsListFeature } from "@/features/topic/views/topicsList";
import { useState } from "react";

export const TopicsListPage = () => {
  const [open, setOpen] = useState(false);
  return (
    <PageContainer
      headerVariant="tab"
      title="Topics"
      moreOptionsMenu={{
        links: [{ label: "Settings", icon: "settings", href: "/settings" }],
        state: { open, setOpen },
      }}
    >
      <TopicsListFeature />
    </PageContainer>
  );
};
