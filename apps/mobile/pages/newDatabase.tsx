import { Button, Typography } from "@/components/ui";
import { Icon } from "@/components/ui/icons/icon";
import { useWorkSpaces } from "@/features/workspaces/hooks/useWorkSpaces";
import { useWorkspaceEditSheet } from "@/features/workspaces/components/manageWorkspaces/workspaceEditSheet";
import { hsl } from "@/utils/hsl";
import { router } from "expo-router";
import { Image, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const POPOVER_BG = hsl("popover", "theme", "light");
const BUTTON_BG = hsl("secondary", "theme", "light");
const BUTTON_FG = hsl("secondary-foreground", "theme", "light");

export const NewDatabaseScreen = () => {
  const { top, bottom } = useSafeAreaInsets();

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
      className="flex-1 w-full"
      style={{
        backgroundColor: POPOVER_BG,
        paddingTop: top,
        paddingBottom: bottom,
      }}
    >
      <View className="flex-1 items-center justify-center px-6 gap-10">
        <Image
          source={require("../assets/images/icon.png")}
          style={{ width: 100, height: 129 }}
          resizeMode="contain"
        />
        <View className="w-full max-w-sm gap-4">
          <Button
            variant="ghost"
            className="w-full"
            style={{ backgroundColor: BUTTON_BG }}
            onPress={handleCreateWorkspace}
            disabled={loading}
          >
            <View className="flex-row items-center justify-center gap-3">
              <Icon name="plus" hslColor={BUTTON_FG} size={18} />
              <Typography style={{ color: BUTTON_FG }}>
                New Workspace
              </Typography>
            </View>
          </Button>
          <Button
            variant="ghost"
            className="w-full"
            style={{ backgroundColor: BUTTON_BG }}
            onPress={handleImportWorkspace}
            disabled={loading}
          >
            <View className="flex-row items-center justify-center gap-3">
              <Icon name="import" hslColor={BUTTON_FG} size={18} />
              <Typography style={{ color: BUTTON_FG }}>
                Import Workspace (.zip)
              </Typography>
            </View>
          </Button>
        </View>
      </View>
    </View>
  );
};
