import { PageContainer } from "@/components/layout/page/pageContainer";
import { SearchFeature } from "@/features/search/views";
import { useTopicDetailsData } from "@/features/topics/features/topicDetails/hooks/useTopicDetailsData";
import { TopicDetailsFeature } from "@/features/topics/features/topicDetails/views";
import { useState } from "react";

export const TopicDetailsPage = () => {
  const [open, setOpen] = useState(false);
  const { topicName, isPending, notes } = useTopicDetailsData();

  return (
    <PageContainer
      headerVariant="tab"
      title={topicName ?? ""}
      subtitle={{ text: "Topic", icon: "tag" }}
      buttons={[<SearchFeature />]}
      moreOptionsMenu={{
        links: [{ label: "Settings", icon: "settings", href: "/settings" }],
        state: { open, setOpen },
      }}
    >
      <TopicDetailsFeature isPending={isPending} notes={notes} />
    </PageContainer>
  );
};
