import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import type { Workspace } from "../../context/workspacesContext";
import { WorkspaceAvatar } from "../manageWorkspaces/workspaceAvatar";
import { Card } from "@/components/ui/card";

type Props = {
  workspace: Workspace;
  isActive: boolean;
  canDelete: boolean;
  onSwitch: () => void;
  onRename: () => void;
  onExport: () => void;
  onDelete: () => void;
  onCancel: () => void;
};

/**
 * Bottom-of-modal action buttons for a single workspace row. Rendered as
 * `customContent` of the modal so we can stack vertically.
 */
export const WorkspaceActionsModal = ({
  workspace,
  canDelete,
  isActive,
  onRename,
  onExport,
  onDelete,
  onCancel,
}: Props) => {
  return (
    <View className="flex-col gap-3">
      <Typography variant="muted">Workspace:</Typography>
      <Card className="p-2" style={{ marginBottom: 30 }}>
        <View className="flex-row gap-2 w-full items-center justify-between">
          <View>
            <View className="flex-row items-center gap-2">
              <WorkspaceAvatar workspace={workspace} />
              <View>
                <Typography variant="h3">{workspace.name}</Typography>
                <Typography variant="small" className="text-muted-foreground">
                  {isActive ? "Active" : "Load"}
                </Typography>
              </View>
            </View>
          </View>
          <View>
            <View className="flex-row gap-2 w-full">
              <Button
                variant="outline"
                size="sm"
                className="w-[50%]"
                onPress={onRename}
              >
                <Typography>Edit</Typography>
              </Button>
              <Button
                variant="default"
                size="sm"
                className="w-[50%]"
                onPress={onExport}
              >
                <Typography>Export</Typography>
              </Button>
            </View>
          </View>
        </View>
      </Card>

      <View className="flex-row gap-2 w-full items-center justify-center">
        <Button variant="default" onPress={onCancel}>
          <Typography>Cancel</Typography>
        </Button>
        <Button variant="destructive" disabled={!canDelete} onPress={onDelete}>
          <Typography>
            {canDelete ? "Delete" : "Cannot delete last workspace"}
          </Typography>
        </Button>
      </View>
    </View>
  );
};
