import { PageContainer } from "@/components/layout/page/pageContainer";
import { TopicsListFeature } from "@/features/topic/views/topicsList";

export const TopicsListPage = () => {
  return (
    <PageContainer headerVariant="tab" title="Topics">
      <TopicsListFeature />
    </PageContainer>
  );
};
