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
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icon } from "@/components/ui/icons/icon";
import { Typography } from "@/components/ui/typography";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import type { Workspace } from "../../context/workspacesContext";
import { WorkspaceAvatar } from "./workspaceAvatar";

type WorkspaceActionsSheetOptions = {
  workspace: Workspace;
  isActive: boolean;
  canDelete: boolean;
  onRename: () => void;
  onExport: () => void;
  onDelete: () => void;
};

type WorkspaceActionsSheetContextType = {
  openWorkspaceActionsSheet: (options: WorkspaceActionsSheetOptions) => void;
  closeWorkspaceActionsSheet: () => void;
};

const WorkspaceActionsSheetContext =
  createContext<WorkspaceActionsSheetContextType | null>(null);
const workspaceActionsSheetRef =
  React.createRef<WorkspaceActionsSheetContextType>();

export const WorkspaceActionsSheetProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const sheet = useBottomSheet();
  const { colorScheme } = useColorScheme();
  const [active, setActive] = useState(false);
  const [options, setOptions] = useState<WorkspaceActionsSheetOptions | null>(
    null
  );
  const optionsRef = useRef<WorkspaceActionsSheetOptions | null>(null);

  const closeWorkspaceActionsSheet = useCallback(() => {
    sheet.close();
  }, [sheet]);

  const openWorkspaceActionsSheet = useCallback(
    (next: WorkspaceActionsSheetOptions) => {
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
    const value = { openWorkspaceActionsSheet, closeWorkspaceActionsSheet };
    workspaceActionsSheetRef.current = value;
    return () => {
      workspaceActionsSheetRef.current = null;
    };
  }, [closeWorkspaceActionsSheet, openWorkspaceActionsSheet]);

  const handleDismiss = useCallback(() => {
    setActive(false);
    setOptions(null);
    optionsRef.current = null;
  }, []);

  const current = options ?? optionsRef.current;

  return (
    <WorkspaceActionsSheetContext.Provider
      value={{ openWorkspaceActionsSheet, closeWorkspaceActionsSheet }}
    >
      {children}
      <BottomSheet>
        <BottomSheetContent
          ref={sheet.ref}
          style={{ zIndex: 200 }}
          enablePanDownToClose
          enableContentPanningGesture={false}
          backgroundStyle={{
            backgroundColor: hsl("background", colorScheme),
          }}
          onDismiss={handleDismiss}
        >
          {active && current ? (
            <BottomSheetView className="gap-3 pt-4 bg-background px-4 pb-6">
              <BottomSheetHeader
                className="bg-background"
                onDismiss={closeWorkspaceActionsSheet}
              >
                <View className="flex-row items-center gap-2">
                  <Icon name="plus" color="foreground" size={18} />
                  <Typography variant="h3">More actions</Typography>
                </View>
              </BottomSheetHeader>

              <Card className="p-2">
                <View className="flex-row items-center gap-2">
                  <WorkspaceAvatar workspace={current.workspace} />
                  <View>
                    <Typography variant="h3">
                      {current.workspace.name}
                    </Typography>
                    <Typography
                      variant="small"
                      className="text-muted-foreground"
                    >
                      {current.isActive ? "Active" : "Load"}
                    </Typography>
                  </View>
                </View>
              </Card>

              <Button
                variant="outline"
                size="default"
                onPress={() => {
                  closeWorkspaceActionsSheet();
                  setTimeout(() => current.onRename(), 200);
                }}
              >
                <View className="flex-row items-center gap-2">
                  <Icon name="pencil" color="foreground" size={18} />
                  <Typography variant="h3">Edit</Typography>
                </View>
              </Button>

              <Button
                variant="outline"
                size="default"
                onPress={() => {
                  closeWorkspaceActionsSheet();
                  setTimeout(() => current.onExport(), 200);
                }}
              >
                <View className="flex-row items-center gap-2">
                  <Icon name="download" color="foreground" size={18} />
                  <Typography variant="h3">Export</Typography>
                </View>
              </Button>

              <Button
                variant="destructive"
                size="default"
                disabled={!current.canDelete}
                onPress={() => {
                  closeWorkspaceActionsSheet();
                  setTimeout(() => current.onDelete(), 200);
                }}
              >
                <View className="flex-row items-center gap-2">
                  <Icon
                    name="trash-2"
                    color="destructive-foreground"
                    size={18}
                  />
                  <Typography variant="h3">
                    {current.canDelete
                      ? "Delete"
                      : "Cannot delete last workspace"}
                  </Typography>
                </View>
              </Button>
            </BottomSheetView>
          ) : null}
        </BottomSheetContent>
      </BottomSheet>
    </WorkspaceActionsSheetContext.Provider>
  );
};

export const useWorkspaceActionsSheet = () => {
  const context = useContext(WorkspaceActionsSheetContext);
  if (context) return context;
  if (workspaceActionsSheetRef.current) return workspaceActionsSheetRef.current;
  throw new Error(
    "useWorkspaceActionsSheet must be used inside WorkspaceActionsSheetProvider"
  );
};
