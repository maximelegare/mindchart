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
  BottomSheetScrollView,
  useBottomSheet,
} from "@/components/primitives/bottomSheet/bottom-sheet.native";
import { Icon } from "@/components/ui/icons/icon";
import type { IconName } from "@/components/ui/icons/icon-registry";
import { Typography } from "@/components/ui/typography";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { WorkspaceEdit, type WorkspaceFormValues } from "./workspaceEdit";

type WorkspaceEditSheetOptions = {
  mode: "create" | "edit";
  initialName?: string;
  initialColor?: [string, string];
  initialIcon?: IconName;
  description?: string;
  confirmLabel: string;
  onConfirm: (values: WorkspaceFormValues) => void | Promise<void>;
};

type WorkspaceEditSheetContextType = {
  openWorkspaceEditSheet: (options: WorkspaceEditSheetOptions) => void;
  closeWorkspaceEditSheet: () => void;
};

const WorkspaceEditSheetContext =
  createContext<WorkspaceEditSheetContextType | null>(null);
const workspaceEditSheetRef = React.createRef<WorkspaceEditSheetContextType>();

export const WorkspaceEditSheetProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const sheet = useBottomSheet();
  const { colorScheme } = useColorScheme();
  const [active, setActive] = useState(false);
  const [options, setOptions] = useState<WorkspaceEditSheetOptions | null>(
    null
  );
  const optionsRef = useRef<WorkspaceEditSheetOptions | null>(null);

  const closeWorkspaceEditSheet = useCallback(() => {
    sheet.close();
  }, [sheet]);

  const openWorkspaceEditSheet = useCallback(
    (next: WorkspaceEditSheetOptions) => {
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
    const value = { openWorkspaceEditSheet, closeWorkspaceEditSheet };
    workspaceEditSheetRef.current = value;
    return () => {
      workspaceEditSheetRef.current = null;
    };
  }, [closeWorkspaceEditSheet, openWorkspaceEditSheet]);

  const handleDismiss = useCallback(() => {
    setActive(false);
    setOptions(null);
    optionsRef.current = null;
  }, []);

  const current = options ?? optionsRef.current;
  const title = current?.mode === "edit" ? "Edit workspace" : "New workspace";

  return (
    <WorkspaceEditSheetContext.Provider
      value={{ openWorkspaceEditSheet, closeWorkspaceEditSheet }}
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
          backgroundStyle={{
            backgroundColor: hsl("background", colorScheme),
          }}
          onDismiss={handleDismiss}
        >
          {active && current ? (
            <>
              <BottomSheetHeader
                className="bg-background"
                onDismiss={closeWorkspaceEditSheet}
              >
                <View className="flex-row items-center gap-2">
                  <Icon
                    name={current.mode === "edit" ? "pencil" : "plus"}
                    color="foreground"
                    size={18}
                  />
                  <Typography variant="h3">{title}</Typography>
                </View>
              </BottomSheetHeader>
              <BottomSheetScrollView
                className="bg-background px-4"
                contentContainerStyle={{ paddingBottom: 40, gap: 8 }}
                keyboardShouldPersistTaps="handled"
              >
                <WorkspaceEdit
                  initialName={current.initialName}
                  initialColor={current.initialColor}
                  initialIcon={current.initialIcon}
                  description={current.description}
                  confirmLabel={current.confirmLabel}
                  onCancel={closeWorkspaceEditSheet}
                  onConfirm={async (values) => {
                    await current.onConfirm(values);
                  }}
                  inBottomSheet
                />
              </BottomSheetScrollView>
            </>
          ) : null}
        </BottomSheetContent>
      </BottomSheet>
    </WorkspaceEditSheetContext.Provider>
  );
};

export const useWorkspaceEditSheet = () => {
  const context = useContext(WorkspaceEditSheetContext);
  if (context) return context;
  if (workspaceEditSheetRef.current) return workspaceEditSheetRef.current;
  throw new Error(
    "useWorkspaceEditSheet must be used inside WorkspaceEditSheetProvider"
  );
};
