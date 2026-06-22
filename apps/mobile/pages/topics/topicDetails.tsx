import { PageContainer } from "@/components/layout/page/pageContainer";
import { SearchFeature } from "@/features/search/views";
import { TopicDetailsFeature } from "@/features/topics/features/topicDetails/views";
import { useState } from "react";

export const TopicDetailsPage = () => {
  const [open, setOpen] = useState(false);
  return (
    <PageContainer
      headerVariant="tab"
      title="Topic"
      buttons={<SearchFeature />}
      moreOptionsMenu={{
        links: [{ label: "Settings", icon: "settings", href: "/settings" }],
        state: { open, setOpen },
      }}
    >
      <TopicDetailsFeature />
    </PageContainer>
  );
};
