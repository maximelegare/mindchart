import { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import type { IconName } from "@/components/ui/icons/icon-registry";
import { useModal } from "@/components/ui/modal/modal";
import { useWorkSpaces } from "@/features/workspaces/hooks/useWorkSpaces";
import { WorkspaceActionsModal } from "@/features/workspaces/components/modals/workspaceActionsModal";
import { useWorkspaceEditSheet } from "@/features/workspaces/components/manageWorkspaces/workspaceEditSheet";
import { WorkspacePasswordModal } from "@/features/workspaces/components/modals/workspacePasswordModal";
import type { Workspace } from "@/features/workspaces/context/workspacesContext";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import { Gutter } from "@/components/ui/gutter";
import { WorkspaceAvatar } from "@/features/workspaces/components/manageWorkspaces/workspaceAvatar";
import { Icon } from "@/components/ui/icons/icon";
import { hasKeyForWorkspace } from "@/features/workspaces/services/workspaceKeyService";
import { WorkspaceKeyMissingError } from "@/features/workspaces/services/workspaceKeyErrors";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";

export const ManageWorkspaceLayout = () => {
  const {
    workspaces,
    activeWorkspaceId,
    activeWorkspace,
    switchWorkspace,
    renameWorkspace,
    exportWorkspace,
    deleteWorkspace,
  } = useWorkSpaces();
  const { openModal, closeModal, setModalContent } = useModal();
  const { openWorkspaceEditSheet, closeWorkspaceEditSheet } =
    useWorkspaceEditSheet();
  const { colorScheme } = useColorScheme();

  const [hasKeyByWorkspaceId, setHasKeyByWorkspaceId] = useState<
    Record<string, boolean>
  >({});

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        workspaces.map(
          async (w) =>
            [w.id, await hasKeyForWorkspace(w.id)] as [string, boolean]
        )
      );
      if (!cancelled) {
        setHasKeyByWorkspaceId(Object.fromEntries(entries));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [workspaces]);

  const handleSwitch = async (workspace: Workspace) => {
    try {
      await switchWorkspace(workspace.id);
    } catch (error) {
      if (error instanceof WorkspaceKeyMissingError) {
        Alert.alert(
          "Workspace unavailable",
          "This workspace has no encryption key on this device."
        );
        return;
      }
      throw error;
    }
  };

  const openRenameSheet = (workspace: Workspace) => {
    closeModal();
    setTimeout(() => {
      openWorkspaceEditSheet({
        mode: "edit",
        initialName: workspace.name,
        initialColor: workspace.color,
        initialIcon: workspace.icon as IconName | undefined,
        confirmLabel: "Save",
        description: "Choose a new name, color, and icon for this workspace.",
        onConfirm: async ({ name, color, icon }) => {
          await renameWorkspace(workspace.id, name, { color, icon });
          closeWorkspaceEditSheet();
        },
      });
    }, 200);
  };

  const openExportPasswordModal = (workspace: Workspace) => {
    // Use setModalContent (like rename/delete) — closeModal + openModal races
    // because closeModal sets isVisible false in its animation callback.
    setModalContent({
      title: "Export Workspace",
      modalName: undefined,
      description: undefined,
      customContent: () => (
        <WorkspacePasswordModal
          mode="export"
          onCancel={closeModal}
          onConfirm={async (password) => {
            try {
              const result = await exportWorkspace(workspace.id, password);
              if (!result.success) {
                const detail =
                  result.error instanceof Error
                    ? result.error.message
                    : "Could not export this workspace. Please try again.";
                Alert.alert("Export failed", detail);
                return;
              }
              closeModal();
            } catch (error) {
              const err = error as Error;
              Alert.alert(
                "Export failed",
                err?.message ||
                  "Could not export this workspace. Please try again."
              );
            }
          }}
        />
      ),
      onConfirm: undefined,
      onCancel: undefined,
      confirmButton: undefined,
      cancelButton: undefined,
    });
  };

  const openDeleteModal = (workspace: Workspace) => {
    setModalContent({
      modalName: "DELETE_WORKSPACE",
      customContent: undefined,
      onConfirm: async () => {
        await deleteWorkspace(workspace.id);
        closeModal();
      },
      onCancel: closeModal,
    });
  };

  const openActionsModal = (workspace: Workspace) => {
    const isActive = workspace.id === activeWorkspaceId;
    const canDelete = workspaces.length > 1 || !isActive;
    openModal({
      title: "More actions",
      aboveBottomSheet: true,
      customContent: () => (
        <WorkspaceActionsModal
          workspace={workspace}
          isActive={isActive}
          canDelete={canDelete}
          onSwitch={async () => {
            closeModal();
            await handleSwitch(workspace);
          }}
          onRename={() => openRenameSheet(workspace)}
          onExport={() => openExportPasswordModal(workspace)}
          onDelete={() => openDeleteModal(workspace)}
          onCancel={closeModal}
        />
      ),
    });
  };

  const divider = {
    borderBottomWidth: 1,
    borderBottomColor: hsl("border", colorScheme),
  };

  return (
    <View>
      <Gutter size="none" className="py-2">
        <View className="flex-col pb-4" style={divider}>
          <Typography variant="h3" padding>
            Manage Workspaces
          </Typography>
          <Typography variant="p" padding>
            Manage your workspaces here. Each workspace has its seperate
            database.
          </Typography>
        </View>

        <View className="py-4" style={divider}>
          <Typography
            variant="h4"
            padding
            style={{ color: hsl("muted-foreground", colorScheme) }}
          >
            Active Workspace
          </Typography>
          <View className="py-2 flex-row items-center">
            <View className="flex-row items-center gap-2">
              <WorkspaceAvatar />
              <Typography variant="h3">
                {activeWorkspace?.name ?? "None"}
              </Typography>
            </View>
          </View>
        </View>

        <View className="pt-4">
          <Typography
            variant="h4"
            padding
            style={{ color: hsl("muted-foreground", colorScheme) }}
          >
            Available Workspaces
          </Typography>
          <View className="flex-col">
            {workspaces.map((workspace, index) => {
              const isActive = workspace.id === activeWorkspace?.id;
              const hasKey = hasKeyByWorkspaceId[workspace.id] ?? false;
              const isLast = index === workspaces.length - 1;
              return (
                <View
                  key={workspace.id}
                  className="py-3 flex-row items-center"
                  style={[
                    !isLast ? divider : null,
                    { opacity: isActive ? 1 : 0.7 },
                  ]}
                >
                  <View className="flex-1 flex-row items-center gap-2">
                    <WorkspaceAvatar workspace={workspace} />
                    <View>
                      <Typography variant="h3" className="text-base">
                        {workspace.name}
                      </Typography>
                      <Typography
                        variant="small"
                        className="text-muted-foreground"
                      >
                        {isActive ? "Active" : hasKey ? "Load" : "Key missing"}
                      </Typography>
                    </View>
                  </View>

                  <View className="flex-row items-center">
                    <Button
                      onPress={() => handleSwitch(workspace)}
                      disabled={isActive || !hasKey}
                      size="sm"
                      variant="outline"
                      className="flex-row items-center gap-2"
                    >
                      <Typography>
                        {isActive
                          ? "Active"
                          : hasKey
                            ? "Switch"
                            : "Unavailable"}
                      </Typography>
                      {!isActive && hasKey && (
                        <Icon
                          name="arrow-right-left"
                          color="foreground"
                          size={16}
                        />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onPress={() => openActionsModal(workspace)}
                    >
                      <Icon
                        name="ellipsis-vertical"
                        color="foreground"
                        size={18}
                      />
                    </Button>
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </Gutter>
    </View>
  );
};
