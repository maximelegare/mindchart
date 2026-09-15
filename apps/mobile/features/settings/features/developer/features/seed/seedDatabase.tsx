import { useNotesAndThoughtsController } from "@/api/controllers/useNotesAndThoughtsController";
import { Button, Typography } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/modal/custom/loadingState/loadingState";
import { useModal } from "@/components/ui/modal/modal";
import { useState } from "react";
import { Alert, StyleProp, View, ViewStyle } from "react-native";

import { seedNotes } from "@/seed/parsedSeedData";
import { Card } from "@/components/ui/card";
import { Gutter } from "@/components/ui/gutter";
import { cn } from "@/lib/cn";
import { useLlamaEmbeddings } from "@/features/llama/hooks/useLlamaEmbeddings";
import {
  SettingsSeedDatabaseDescription,
  SettingsSeedDatabaseTitle,
  settingsSeedDatabaseEnterNumberAlert,
  settingsSeedDatabaseFailedAlertTitle,
  settingsSeedDatabaseLoadingTitle,
  settingsSeedDatabaseNotesPlaceholder,
} from "@/features/settings/features/developer/labels/settingsDeveloperLabels";
import { settingsActionSeed } from "@/features/settings/settingsLabels";

export const SeedDatabaseFeature = ({
  className,
  style,
}: {
  className?: string;
  style?: StyleProp<ViewStyle>;
}) => {
  const [numberOfNotes, setNumberOfNotes] = useState(
    seedNotes.length.toString()
  );
  const { openModal, closeModal } = useModal();
  const { useSeedDatabaseMutation } = useNotesAndThoughtsController();
  const { mutateAsync: seedDatabaseAsync } = useSeedDatabaseMutation();

  const { isReady: isLlamaReady } = useLlamaEmbeddings();
  const seedDatabase = async () => {
    if (numberOfNotes === "") {
      Alert.alert(settingsSeedDatabaseEnterNumberAlert());
      return;
    }
    openModal({
      dismissOnBackgroundPress: false,
      customContent: () => (
        <LoadingState title={settingsSeedDatabaseLoadingTitle()} size="large" />
      ),
    });
    try {
      await seedDatabaseAsync(parseInt(numberOfNotes));
    } catch (error) {
      console.error(error);
      const message =
        error instanceof Error ? error.message : String(error ?? "");
      Alert.alert(settingsSeedDatabaseFailedAlertTitle(), message);
    } finally {
      closeModal();
    }
  };

  return (
    <Card className={cn(className)} style={style}>
      <Gutter size="md" className="py-2">
        <Typography variant="h3" padding>
          <SettingsSeedDatabaseTitle />
        </Typography>
        <Typography variant="p" padding className="mb-2">
          <SettingsSeedDatabaseDescription maxNotes={seedNotes.length} />
        </Typography>
        <View className="flex-row gap-2">
          <Button
            variant="default"
            onPress={() => seedDatabase()}
            disabled={!isLlamaReady}
          >
            <Typography>{settingsActionSeed()}</Typography>
          </Button>
          <Input
            style={{ width: 100 }}
            placeholder={settingsSeedDatabaseNotesPlaceholder()}
            keyboardType="number-pad"
            value={numberOfNotes}
            onChangeText={setNumberOfNotes}
          />
        </View>
      </Gutter>
    </Card>
  );
};
