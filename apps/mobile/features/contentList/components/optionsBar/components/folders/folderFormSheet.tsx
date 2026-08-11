import React, {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { View } from "react-native";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetView,
  useBottomSheet,
} from "@/components/primitives/bottomSheet/bottom-sheet.native";
import { Icon } from "@/components/ui/icons/icon";
import { Typography } from "@/components/ui/typography";
import { FolderFormModalContent } from "./folderFormModalContent";

type FolderFormSheetOptions = {
  mode: "create" | "rename";
  initialLabel?: string;
  onSave: (label: string) => Promise<void>;
};

type FolderFormSheetContextType = {
  openFolderFormSheet: (options: FolderFormSheetOptions) => void;
  closeFolderFormSheet: () => void;
};

const FolderFormSheetContext = createContext<FolderFormSheetContextType | null>(
  null
);
const folderFormSheetRef = React.createRef<FolderFormSheetContextType>();

export const FolderFormSheetProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const sheet = useBottomSheet();
  const [active, setActive] = useState(false);
  const [options, setOptions] = useState<FolderFormSheetOptions | null>(null);
  const optionsRef = useRef<FolderFormSheetOptions | null>(null);

  const closeFolderFormSheet = useCallback(() => {
    sheet.close();
  }, [sheet]);

  const openFolderFormSheet = useCallback(
    (next: FolderFormSheetOptions) => {
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
  }, []);

  const current = options ?? optionsRef.current;
  const title = current?.mode === "rename" ? "Rename folder" : "New folder";

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
                  <Typography variant="h3">{title}</Typography>
                </View>
              </BottomSheetHeader>
              <FolderFormModalContent
                mode={current.mode}
                initialLabel={current.initialLabel}
                onSave={current.onSave}
                onClose={closeFolderFormSheet}
                inBottomSheet
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
