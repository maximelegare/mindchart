import { PageContainer } from "@/components/layout/page/pageContainer";
import { TopicsListFeature } from "@/features/topic/features/topicsList/views";

export const TopicsListPage = () => {
  return (
    <PageContainer headerVariant="tab" title="Manage Topics">
      <TopicsListFeature />
    </PageContainer>
  );
};
