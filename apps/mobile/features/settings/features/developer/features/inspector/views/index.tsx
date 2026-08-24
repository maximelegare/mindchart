import * as React from "react";
import { View, Alert } from "react-native";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";

import {
  ThoughtTable,
  NoteTable,
  EmbeddingTable,
  AppDataTable,
  CategoryTable,
  SettingTable,
} from "@repo/sqlite";
import {
  getOPDatabase,
  removeDatabaseFile,
  closeOPDatabase,
} from "@repo/sqlite";
import { SpaceFiller } from "@/components/ui/spaceFiller";
import { Migrator } from "@/features/settings/features/developer/features/inspector/components/migrator";
import { useRouter } from "expo-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  settingsDbInspectorActionClear,
  settingsDbInspectorDeleteDbFileAlertMessage,
  settingsDbInspectorDeleteDbFileAlertTitle,
  settingsDbInspectorDeleteDbFileButton,
  settingsDbInspectorClearTableAlertMessage,
  settingsDbInspectorClearTableAlertTitle,
  settingsDbInspectorNoTablesFound,
  settingsDbInspectorRowsLabel,
} from "@/features/settings/features/developer/labels/settingsDeveloperLabels";
import {
  settingsActionCancel,
  settingsActionDelete,
} from "@/features/settings/settingsLabels";

type TableInfo = {
  name: string;
  count: number;
};

export const DatabaseInspectorFeature = () => {
  const queryClient = useQueryClient();
  const db = getOPDatabase();

  const router = useRouter();
  const [tables, setTables] = React.useState<TableInfo[]>([]);

  const knownTables = [
    { name: "thought", table: ThoughtTable },
    { name: "note", table: NoteTable },
    { name: "embedding", table: EmbeddingTable },
    { name: "app_data", table: AppDataTable },
    { name: "category", table: CategoryTable },
    { name: "setting", table: SettingTable },
  ] as const;

  // Load table counts
  const loadTables = React.useCallback(async () => {
    const tableCounts: TableInfo[] = [];

    for (const t of knownTables) {
      try {
        const rows = await db.select().from(t.table).all();
        tableCounts.push({ name: t.name, count: rows.length });
      } catch (err) {
        console.warn(`Failed to read table ${t.name}:`, err);
      }
    }

    setTables(tableCounts);
  }, [db]);

  // Load on mount
  React.useEffect(() => {
    loadTables();
  }, [loadTables]);

  const clearTable = (name: string) => {
    const tableDef = knownTables.find((t) => t.name === name)?.table;
    if (!tableDef) return;

    Alert.alert(
      settingsDbInspectorClearTableAlertTitle(),
      settingsDbInspectorClearTableAlertMessage(name),
      [
        { text: settingsActionCancel(), style: "cancel" },
        {
          text: settingsDbInspectorActionClear(),
          style: "destructive",
          onPress: () => {
            db.delete(tableDef).execute();
            loadTables();
          },
        },
      ]
    );
  };

  const dropDatabaseFile = () => {
    Alert.alert(
      settingsDbInspectorDeleteDbFileAlertTitle(),
      settingsDbInspectorDeleteDbFileAlertMessage(),
      [
        { text: settingsActionCancel(), style: "cancel" },
        {
          text: settingsActionDelete(),
          style: "destructive",
          onPress: async () => {
            await closeOPDatabase();
            await removeDatabaseFile();
            queryClient.clear();
            router.replace("/newDatabase");
          },
        },
      ]
    );
  };

  return (
    <>
      <View className="gap-4 pb-4">
        <View className="flex-row gap-4">
          <Migrator />
          <Button variant="destructive" onPress={dropDatabaseFile}>
            <Typography>{settingsDbInspectorDeleteDbFileButton()}</Typography>
          </Button>
        </View>
      </View>

      {tables.map((table) => (
        <View
          key={table.name}
          style={{
            padding: 12,
            marginBottom: 12,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#ddd",
          }}
        >
          <Typography style={{ fontSize: 16, fontWeight: "500" }}>
            {table.name}
          </Typography>
          <Typography style={{ opacity: 0.6, marginBottom: 8 }}>
            {settingsDbInspectorRowsLabel(table.count)}
          </Typography>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <Button variant="secondary" onPress={() => clearTable(table.name)}>
              <Typography>{settingsDbInspectorActionClear()}</Typography>
            </Button>
          </View>
        </View>
      ))}

      {tables.length === 0 && (
        <Typography style={{ opacity: 0.5 }}>
          {settingsDbInspectorNoTablesFound()}
        </Typography>
      )}

      <SpaceFiller
        sizes={{ marginBottom: ["TAB_BAR_HEIGHT", "HEADER_OVERLAP"] }}
      />
    </>
  );
};
