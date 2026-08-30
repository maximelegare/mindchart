import { useLayoutEffect, useRef } from "react";
import { View } from "react-native";
import { SpaceFiller } from "@/components/ui/spaceFiller";
import { usePageScroll } from "@/components/layout/page/pageContainer";
import { FolderCardsList } from "../components/cards/folderCard/folderCardsList";
import { useOptionsBar } from "../components/optionsBar/context/optionBarContext";
import { usePaginatedNotesControls } from "../features/pagination/hooks/usePaginatedNotes";
import { UiGetter } from "../components/uiGetter";

export const ContentListFeature = () => {
  const showFolders = useOptionsBar((s) => s.foldersMode === "with");
  const page = useOptionsBar((s) => s.page);
  const { isFetching } = usePaginatedNotesControls({
    enabled: !showFolders,
  });
  const { scrollToTop } = usePageScroll();
  const previousPage = useRef(page);
  const shouldScrollToTop = useRef(false);

  useLayoutEffect(() => {
    if (previousPage.current === page) return;
    previousPage.current = page;
    shouldScrollToTop.current = true;
    scrollToTop();
  }, [page, scrollToTop]);

  useLayoutEffect(() => {
    if (!shouldScrollToTop.current || isFetching) return;
    shouldScrollToTop.current = false;
    scrollToTop();
    requestAnimationFrame(() => {
      scrollToTop();
    });
  }, [isFetching, scrollToTop]);

  return (
    <View>
      {showFolders ? <FolderCardsList /> : null}
      <UiGetter />
      <SpaceFiller
        sizes={{ marginBottom: ["TAB_BAR_HEIGHT", "HEADER_OVERLAP", 15] }}
      />
    </View>
  );
};
