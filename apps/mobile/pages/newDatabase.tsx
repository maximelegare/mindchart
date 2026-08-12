import { Button, Typography } from "@/components/ui";
import { Icon } from "@/components/ui/icons/icon";
import { useWorkSpaces } from "@/features/workspaces/hooks/useWorkSpaces";
import { useWorkspaceEditSheet } from "@/features/workspaces/components/manageWorkspaces/workspaceEditSheet";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { router } from "expo-router";
import { View, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const NewDatabaseScreen = () => {
  const { colorScheme } = useColorScheme();
  const { bottom } = useSafeAreaInsets();

  const { createWorkspace, importWorkspace, loading } = useWorkSpaces();
  const { openWorkspaceEditSheet, closeWorkspaceEditSheet } =
    useWorkspaceEditSheet();

  const handleCreateWorkspace = () => {
    openWorkspaceEditSheet({
      mode: "create",
      confirmLabel: "Create",
      description: "Each workspace has its own isolated database.",
      onConfirm: async ({ name, color, icon }) => {
        closeWorkspaceEditSheet();
        await createWorkspace(name, { color, icon });
        router.replace("/(tabs)");
      },
    });
  };

  const handleImportWorkspace = async () => {
    const result = await importWorkspace();
    if (result.success) {
      router.replace("/(tabs)");
    }
  };

  return (
    <View
      className="h-full w-full justify-center"
      style={{ backgroundColor: hsl("border", colorScheme, 30) }}
    >
      <View className="flex-col items-center justify-center relative h-full">
        <Image
          source={require("../assets/images/icon.png")}
          style={{ opacity: 0.06, width: 1500, height: 1500 }}
          className="absolute"
        />
        <View
          className="flex-col items-center justify-between absolute"
          style={{ height: "50%", bottom: bottom + 100 }}
        >
          <View className="flex-col gap-4 items-center justify-between">
            <Button
              variant="secondary"
              onPress={handleCreateWorkspace}
              disabled={loading}
            >
              <View className="flex-row items-center justify-center gap-3">
                <Icon name="plus" color="background" size={18} />
                <Typography>New Workspace</Typography>
              </View>
            </Button>
            <Button
              variant="secondary"
              onPress={handleImportWorkspace}
              disabled={loading}
            >
              <View className="flex-row items-center justify-center gap-3">
                <Icon name="import" color="background" size={18} />
                <Typography>Import Workspace (.zip)</Typography>
              </View>
            </Button>
          </View>
          <Image
            source={require("../assets/images/icon.png")}
            style={{ width: 100, height: 129 }}
          />
        </View>
      </View>
    </View>
  );
};
