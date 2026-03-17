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
import { Migrator } from "@/features/settings/features/database/inspector/components/migrator";
import { useRouter } from "expo-router";

type TableInfo = {
  name: string;
  count: number;
};

export const DatabaseInspectorFeature = () => {
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

    Alert.alert("Clear table?", `Remove all rows from "${name}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => {
          db.delete(tableDef).execute();
          loadTables();
        },
      },
    ]);
  };

  // const dropTable = (name: string) => {
  //   Alert.alert('Delete table?', `This will permanently delete "${name}".`, [
  //     { text: 'Cancel', style: 'cancel' },
  //     {
  //       text: 'Delete',
  //       style: 'destructive',
  //       onPress: () => {
  //         db.run(`DROP TABLE IF EXISTS ${name}`);
  //         loadTables();
  //       },
  //     },
  //   ]);
  // };

  const dropDatabaseFile = () => {
    Alert.alert(
      "Delete Database File?",
      `This will permanently delete your database.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            // Close the database connection and reset the cached instance
            await closeOPDatabase();
            // Delete the database file
            await removeDatabaseFile();
            // Navigate to new database screen
            router.replace("/newDatabase");
          },
        },
      ]
    );
  };

  return (
    // <ScrollView contentContainerStyle={{ padding: 16 }}>
    <>
      <View className="flex-row gap-4 pb-4">
        <Migrator />
        <Button variant="destructive" onPress={dropDatabaseFile}>
          <Typography>Delete DB File</Typography>
        </Button>
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
            Rows: {table.count}
          </Typography>

          <View style={{ flexDirection: "row", gap: 8 }}>
            <Button variant="secondary" onPress={() => clearTable(table.name)}>
              <Typography>Clear</Typography>
            </Button>
          </View>
        </View>
      ))}

      {tables.length === 0 && (
        <Typography style={{ opacity: 0.5 }}>No tables found.</Typography>
      )}

      <SpaceFiller
        sizes={{ marginBottom: ["TAB_BAR_HEIGHT", "HEADER_OVERLAP"] }}
      />
    </>
    // </ScrollView>
  );
};
