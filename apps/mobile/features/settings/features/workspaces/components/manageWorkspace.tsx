import { useEffect, useState } from "react";
import { Alert, View } from "react-native";
import type { IconName } from "@/components/ui/icons/icon-registry";
import { useModal } from "@/components/ui/modal/modal";
import { useWorkSpaces } from "@/features/workspaces/hooks/useWorkSpaces";
import { useWorkspaceActionsSheet } from "@/features/workspaces/components/manageWorkspaces/workspaceActionsSheet";
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
import {
  SettingsActiveWorkspaceHeading,
  SettingsAvailableWorkspacesHeading,
  SettingsManageWorkspacesDescription,
  SettingsManageWorkspacesTitle,
  settingsExportFailedAlertMessage,
  settingsExportFailedAlertTitle,
  settingsExportWorkspaceModalTitle,
  settingsWorkspaceActionSwitch,
  settingsWorkspaceActionUnavailable,
  settingsWorkspaceEditDescription,
  settingsWorkspaceStatusActive,
  settingsWorkspaceStatusKeyMissing,
  settingsWorkspaceStatusLoad,
  settingsWorkspaceUnavailableAlertMessage,
  settingsWorkspaceUnavailableAlertTitle,
} from "@/features/settings/settingsWorkspacesLabels";
import {
  settingsActionSave,
  settingsStatusNone,
} from "@/features/settings/settingsLabels";

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
  const { openModal, closeModal } = useModal();
  const { openWorkspaceActionsSheet } = useWorkspaceActionsSheet();
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
          settingsWorkspaceUnavailableAlertTitle(),
          settingsWorkspaceUnavailableAlertMessage()
        );
        return;
      }
      throw error;
    }
  };

  const openRenameSheet = (workspace: Workspace) => {
    openWorkspaceEditSheet({
      mode: "edit",
      initialName: workspace.name,
      initialColor: workspace.color,
      initialIcon: workspace.icon as IconName | undefined,
      confirmLabel: settingsActionSave(),
      description: settingsWorkspaceEditDescription(),
      onConfirm: async ({ name, color, icon }) => {
        await renameWorkspace(workspace.id, name, { color, icon });
        closeWorkspaceEditSheet();
      },
    });
  };

  const openExportPasswordModal = (workspace: Workspace) => {
    openModal({
      title: settingsExportWorkspaceModalTitle(),
      aboveBottomSheet: true,
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
                    : settingsExportFailedAlertMessage();
                Alert.alert(settingsExportFailedAlertTitle(), detail);
                return;
              }
              closeModal();
            } catch (error) {
              const err = error as Error;
              Alert.alert(
                settingsExportFailedAlertTitle(),
                err?.message || settingsExportFailedAlertMessage()
              );
            }
          }}
        />
      ),
    });
  };

  const openDeleteModal = (workspace: Workspace) => {
    openModal({
      modalName: "DELETE_WORKSPACE",
      aboveBottomSheet: true,
      onConfirm: async () => {
        await deleteWorkspace(workspace.id);
        closeModal();
      },
      onCancel: closeModal,
    });
  };

  const openActionsSheet = (workspace: Workspace) => {
    const isActive = workspace.id === activeWorkspaceId;
    const canDelete = workspaces.length > 1 || !isActive;
    openWorkspaceActionsSheet({
      workspace,
      isActive,
      canDelete,
      onRename: () => openRenameSheet(workspace),
      onExport: () => openExportPasswordModal(workspace),
      onDelete: () => openDeleteModal(workspace),
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
            <SettingsManageWorkspacesTitle />
          </Typography>
          <Typography variant="p" padding>
            <SettingsManageWorkspacesDescription />
          </Typography>
        </View>

        <View className="py-4" style={divider}>
          <Typography
            variant="h4"
            padding
            style={{ color: hsl("muted-foreground", colorScheme) }}
          >
            <SettingsActiveWorkspaceHeading />
          </Typography>
          <View className="py-2 flex-row items-center">
            <View className="flex-row items-center gap-2">
              <WorkspaceAvatar />
              <Typography variant="h3">
                {activeWorkspace?.name ?? settingsStatusNone()}
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
            <SettingsAvailableWorkspacesHeading />
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
                        {isActive
                          ? settingsWorkspaceStatusActive()
                          : hasKey
                            ? settingsWorkspaceStatusLoad()
                            : settingsWorkspaceStatusKeyMissing()}
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
                          ? settingsWorkspaceStatusActive()
                          : hasKey
                            ? settingsWorkspaceActionSwitch()
                            : settingsWorkspaceActionUnavailable()}
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
                      onPress={() => openActionsSheet(workspace)}
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
