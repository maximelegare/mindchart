import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { View } from "react-native";
import { canCreateChildFolder, getFolderIdsFromPath } from "@repo/sqlite";
import { Folder } from "@repo/zod-schemas/src/schemas";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetView,
  useBottomSheet,
} from "@/components/primitives/bottomSheet/bottom-sheet.native";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Icon } from "@/components/ui/icons/icon";
import { Typography } from "@/components/ui/typography";
import { useControllers } from "@/api/controllers/useControllers";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { FOLDER_TREE_ROOT_ID } from "@/features/contentList/components/folderTree/folderTreeUtils";
import {
  FolderFormTitle,
  folderBreadcrumbRootLabel,
  folderNestingLimitErrorMessage,
} from "./folderFormLabels";
import { FolderFormModalContent } from "./folderFormModalContent";

type FolderFormSheetOptions = {
  mode: "create" | "rename";
  initialLabel?: string;
  /** Parent location for create — null means root. */
  parentFolder?: Folder | null;
  onSave: (label: string, parentFolder?: Folder | null) => Promise<void>;
};

type FolderFormSheetContextType = {
  openFolderFormSheet: (options: FolderFormSheetOptions) => void;
  closeFolderFormSheet: () => void;
};

const FolderFormSheetContext = createContext<FolderFormSheetContextType | null>(
  null
);
const folderFormSheetRef = React.createRef<FolderFormSheetContextType>();

function LocationBreadcrumbs({
  parentFolder,
}: {
  parentFolder: Folder | null;
}) {
  const { colorScheme } = useColorScheme();
  const { folders } = useControllers();
  const { data: allFolders = [] } = folders.useFetchAllFoldersQuery();

  const foldersById = useMemo(
    () => new Map(allFolders.map((folder) => [folder.id, folder])),
    [allFolders]
  );

  const breadcrumbRootLabel = folderBreadcrumbRootLabel();

  const items = useMemo(() => {
    const root = { id: FOLDER_TREE_ROOT_ID, name: breadcrumbRootLabel };
    if (!parentFolder) return [root];
    const ids = getFolderIdsFromPath(parentFolder.path);
    return [
      root,
      ...ids.map((id) => ({
        id,
        name: foldersById.get(id)?.label ?? id,
      })),
    ];
  }, [breadcrumbRootLabel, foldersById, parentFolder]);

  return (
    <View
      className="h-10 w-full flex-row items-center overflow-hidden rounded-full shrink-0"
      style={{ backgroundColor: hsl("card", colorScheme) }}
    >
      <Breadcrumbs items={items} onNavigate={() => {}} disabled />
    </View>
  );
}

export const FolderFormSheetProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const sheet = useBottomSheet();
  const [active, setActive] = useState(false);
  const [options, setOptions] = useState<FolderFormSheetOptions | null>(null);
  const [parentFolder, setParentFolder] = useState<Folder | null>(null);
  const optionsRef = useRef<FolderFormSheetOptions | null>(null);
  const parentFolderRef = useRef<Folder | null>(null);

  const closeFolderFormSheet = useCallback(() => {
    sheet.close();
  }, [sheet]);

  const openFolderFormSheet = useCallback(
    (next: FolderFormSheetOptions) => {
      const initialParent =
        next.mode === "create" ? (next.parentFolder ?? null) : null;
      parentFolderRef.current = initialParent;
      setParentFolder(initialParent);
      optionsRef.current = next;
      setOptions(next);
      setActive(true);
      setTimeout(() => {
        sheet.open();
      }, 50);
    },
    [sheet]
  );

  React.useEffect(() => {
    const value = { openFolderFormSheet, closeFolderFormSheet };
    folderFormSheetRef.current = value;
    return () => {
      folderFormSheetRef.current = null;
    };
  }, [closeFolderFormSheet, openFolderFormSheet]);

  const handleDismiss = useCallback(() => {
    setActive(false);
    setOptions(null);
    optionsRef.current = null;
    parentFolderRef.current = null;
    setParentFolder(null);
  }, []);

  const current = options ?? optionsRef.current;
  const isCreate = current?.mode === "create";
  const canCreateHere = canCreateChildFolder(parentFolder?.path ?? null);

  return (
    <FolderFormSheetContext.Provider
      value={{ openFolderFormSheet, closeFolderFormSheet }}
    >
      {children}
      <BottomSheet>
        <BottomSheetContent
          ref={sheet.ref}
          style={{ zIndex: 200 }}
          snapPoints={["100%"]}
          enableDynamicSizing={false}
          enablePanDownToClose
          enableContentPanningGesture={false}
          onDismiss={handleDismiss}
        >
          {active && current ? (
            <BottomSheetView className="flex-1 h-full gap-4 pt-4 bg-background">
              <BottomSheetHeader
                className="bg-background"
                onDismiss={closeFolderFormSheet}
              >
                <View className="flex-row items-center gap-2">
                  <Icon name="folder" color="foreground" size={18} />
                  <Typography variant="h3">
                    <FolderFormTitle mode={current.mode} />
                  </Typography>
                </View>
              </BottomSheetHeader>
              {isCreate ? (
                <LocationBreadcrumbs parentFolder={parentFolder} />
              ) : null}
              <FolderFormModalContent
                mode={current.mode}
                initialLabel={current.initialLabel}
                onSave={async (label) => {
                  if (current.mode === "create") {
                    const parent = parentFolderRef.current;
                    if (!canCreateChildFolder(parent?.path ?? null)) {
                      throw new Error(folderNestingLimitErrorMessage());
                    }
                    await current.onSave(label, parent);
                    return;
                  }
                  await current.onSave(label);
                }}
                onClose={closeFolderFormSheet}
                inBottomSheet
                disableSubmit={isCreate && !canCreateHere}
              />
            </BottomSheetView>
          ) : null}
        </BottomSheetContent>
      </BottomSheet>
    </FolderFormSheetContext.Provider>
  );
};

export const useFolderFormSheet = () => {
  const context = useContext(FolderFormSheetContext);
  if (context) return context;
  if (folderFormSheetRef.current) return folderFormSheetRef.current;
  throw new Error(
    "useFolderFormSheet must be used inside FolderFormSheetProvider"
  );
};
