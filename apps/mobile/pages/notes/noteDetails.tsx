import { PageContainer } from "@/components/layout/page/pageContainer";
import { NoteDetailsFeature } from "@/features/notes/noteDetails/views";

export const NoteDetailsPage = () => {
  return (
    <PageContainer headerVariant="tab" title="Note">
      <NoteDetailsFeature />
    </PageContainer>
  );
};
