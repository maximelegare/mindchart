import { PageContainer } from "@/components/layout/page/pageContainer";
import { NotesListFeature } from "@/features/notes/notesList/views";

export const NotesListPage = () => {
  return (
    <PageContainer headerVariant="stack" title="Notes">
      <NotesListFeature />
    </PageContainer>
  );
};
