import { Button, Typography } from "@/components/ui";
import { Icon } from "@/components/ui/icons/icon";
import { useDatabaseBackup } from "@/features/settings/features/workspace/features/backup/hooks/useDatabaseBackup";
import { Migrator } from "@/features/settings/features/developer/features/inspector/components/migrator";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { router } from "expo-router";
import { View } from "react-native";
import { Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const NewDatabaseScreen = () => {
  const { colorScheme } = useColorScheme();
  const { bottom } = useSafeAreaInsets();

  const { importDatabase } = useDatabaseBackup();

  const handleImportDatabase = async () => {
    await importDatabase();
    router.replace("/(tabs)");
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
            <Migrator button={{ variant: "secondary" }}>
              <View className="flex-row items-center justify-center gap-3">
                <Icon name="plus" color="background" size={18} />
                <Typography>New Database</Typography>
              </View>
            </Migrator>
            <Button variant="secondary" onPress={() => handleImportDatabase()}>
              <View className="flex-row items-center justify-center gap-3">
                <Icon name="import" color="background" size={18} />
                <Typography>Import Database</Typography>
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
