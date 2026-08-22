import React, { useEffect, useState } from "react";
import { Alert } from "react-native";
import { Button, Typography, type ButtonProps } from "@/components/ui";
import { useMigrationHelper } from "@repo/sqlite";
import { useRouter } from "expo-router";
import {
  settingsDbInspectorMigrationFailedTitle,
  settingsDbInspectorNewDatabaseButton,
} from "@/features/settings/settingsDeveloperLabels";

/* -------------------------------------------------- */
/* Migrator */
/* -------------------------------------------------- */

interface MigratorProps {
  button?: Partial<ButtonProps>;
  children?: React.ReactNode;
}

export const Migrator = ({ button, children }: MigratorProps) => {
  const [startMigration, setStartMigration] = useState(false);

  return (
    <>
      <Button
        variant="destructive"
        onPress={() => setStartMigration(true)}
        {...button}
      >
        {children || (
          <Typography>{settingsDbInspectorNewDatabaseButton()}</Typography>
        )}
      </Button>

      {startMigration && <MigrationRunner />}
    </>
  );
};

/* -------------------------------------------------- */
/* MigrationRunner */
/* -------------------------------------------------- */
const MigrationRunner = () => {
  const { success, error } = useMigrationHelper();
  const router = useRouter();

  useEffect(() => {
    if (success) {
      router.replace("/(tabs)");
    }
    if (error) {
      Alert.alert(settingsDbInspectorMigrationFailedTitle(), String(error));
      console.error(error);
    }
  }, [success, error, router]);

  return null;
};
