import { View } from "react-native";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui/typography";
import type { Workspace } from "../context/workspacesContext";

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
  isActive,
  canDelete,
  onSwitch,
  onRename,
  onExport,
  onDelete,
  onCancel,
}: Props) => {
  return (
    <View className="flex-col gap-3">
      <View>
        <Typography variant="h3">{workspace.name}</Typography>
        <Typography variant="muted">
          {isActive ? "Active workspace" : "Tap an action below."}
        </Typography>
      </View>
      {!isActive && (
        <Button variant="default" onPress={onSwitch}>
          <Typography>Switch to this workspace</Typography>
        </Button>
      )}
      <Button variant="secondary" onPress={onRename}>
        <Typography>Rename</Typography>
      </Button>
      <Button variant="secondary" onPress={onExport}>
        <Typography>Export</Typography>
      </Button>
      <Button variant="destructive" disabled={!canDelete} onPress={onDelete}>
        <Typography>
          {canDelete ? "Delete" : "Cannot delete last workspace"}
        </Typography>
      </Button>
      <Button variant="default" onPress={onCancel}>
        <Typography>Cancel</Typography>
      </Button>
    </View>
  );
};
