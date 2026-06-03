import { useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { WorkspaceAvatar } from "@/features/workspaces/components/workspaceAvatar";
import { useWorkspaceKeyRecovery } from "@/features/settings/features/recoveryKeys/hooks/useWorkspaceKeyRecovery";
import { Button } from "@/components/ui/button";
import { useWorkspacesStore } from "@/features/workspaces/context/workspacesContext";
import { Typography } from "@/components/ui";
import { Card } from "@/components/ui/card";

export const WorkspaceRecovery = () => {
  const workspaces = useWorkspacesStore((s) => s.workspaces);
  const [revealedKeyById, setRevealedKeyById] = useState<
    Record<string, string | undefined>
  >({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const { biometricRecoveryEnabled, recoverDatabaseKey } =
    useWorkspaceKeyRecovery();

  const handleRecover = async (workspaceId: string) => {
    setLoadingId(workspaceId);
    try {
      const key = await recoverDatabaseKey(workspaceId);
      setRevealedKeyById((prev) => ({ ...prev, [workspaceId]: key }));
    } catch (e) {
      Alert.alert(
        "Recovery failed",
        e instanceof Error ? e.message : "Unknown error"
      );
    } finally {
      setLoadingId(null);
    }
  };

  const hideKey = (workspaceId: string) => {
    setRevealedKeyById((prev) => {
      const next = { ...prev };
      delete next[workspaceId];
      return next;
    });
  };

  if (workspaces.length === 0) {
    return (
      <Typography variant="muted" padding>
        No workspaces to recover keys for.
      </Typography>
    );
  }

  return (
    <View className="flex-col gap-3">
      {workspaces.map((workspace) => {
        const revealed = revealedKeyById[workspace.id];
        const loading = loadingId === workspace.id;

        return (
          <Card key={workspace.id} className="p-2 gap-3 bg-muted">
            <View className="flex-row items-center gap-3">
              <WorkspaceAvatar workspace={workspace} />
              <Typography variant="h3" className="flex-1">
                {workspace.name}
              </Typography>
            </View>

            {revealed ? (
              <View className="gap-2">
                <Pressable
                  onLongPress={() => {
                    Alert.alert("Database key", revealed);
                  }}
                >
                  <View className="rounded-md bg-muted p-3">
                    <Typography
                      variant="small"
                      className="font-mono text-foreground break-all"
                    >
                      {revealed}
                    </Typography>
                  </View>
                </Pressable>
                <Button
                  variant="outline"
                  size="sm"
                  onPress={() => hideKey(workspace.id)}
                >
                  <Typography>Hide key</Typography>
                </Button>
              </View>
            ) : (
              <Button
                variant="default"
                size="sm"
                disabled={loading || !biometricRecoveryEnabled}
                onPress={() => handleRecover(workspace.id)}
              >
                <Typography>
                  {loading ? "Authenticating…" : "Recover key"}
                </Typography>
              </Button>
            )}
          </Card>
        );
      })}
    </View>
  );
};
