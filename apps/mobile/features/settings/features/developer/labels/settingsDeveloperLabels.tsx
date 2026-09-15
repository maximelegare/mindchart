import { fbs } from "fbtee";

export function SettingsSeedDatabaseTitle() {
  return (
    <fbt desc="Developer settings: seed database title">Seed Database</fbt>
  );
}

export function SettingsSeedDatabaseDescription({
  maxNotes,
}: {
  maxNotes: number;
}) {
  return (
    <fbt desc="Developer settings: seed database description">
      Fill the database with fake data for testing. The maximum number of notes
      is <fbt:param name="maxNotes">{maxNotes}</fbt:param>.
    </fbt>
  );
}

export function settingsSeedDatabaseNotesPlaceholder() {
  return fbs(
    "Number of notes",
    "Developer seed database: number of notes placeholder"
  );
}

export function settingsSeedDatabaseEnterNumberAlert() {
  return fbs(
    "Please enter a number of notes",
    "Developer seed database: missing number alert"
  );
}

export function settingsSeedDatabaseLoadingTitle() {
  return fbs("Seeding Database", "Developer seed database loading title");
}

export function settingsSeedDatabaseFailedAlertTitle() {
  return fbs("Seed failed", "Developer seed database: failure alert title");
}

export function SettingsClearSeedDataTitle() {
  return (
    <fbt desc="Developer settings: clear seed data title">Clear Seed Data</fbt>
  );
}

export function SettingsClearSeedDataDescription() {
  return (
    <fbt desc="Developer settings: clear seed data description">
      Delete all notes, thoughts, and nested folders. Root folders are kept.
    </fbt>
  );
}

export function settingsClearSeedDataLoadingTitle() {
  return fbs("Clearing seed data", "Developer clear seed data loading title");
}

export function settingsClearSeedDataFailedAlertTitle() {
  return fbs(
    "Clear seed failed",
    "Developer clear seed data: failure alert title"
  );
}

export function settingsDbInspectorClearTableAlertTitle() {
  return fbs("Clear table?", "DB inspector: clear table alert title");
}

export function settingsDbInspectorClearTableAlertMessage(tableName: string) {
  return fbs(
    ['Remove all rows from "', fbs.param("tableName", tableName), '"?'],
    "DB inspector: clear table alert message"
  );
}

export function settingsDbInspectorActionClear() {
  return fbs("Clear", "DB inspector: clear table button");
}

export function settingsDbInspectorDeleteDbFileAlertTitle() {
  return fbs(
    "Delete Database File?",
    "DB inspector: delete database file alert title"
  );
}

export function settingsDbInspectorDeleteDbFileAlertMessage() {
  return fbs(
    "This will permanently delete your database.",
    "DB inspector: delete database file alert message"
  );
}

export function settingsDbInspectorDeleteDbFileButton() {
  return fbs("Delete DB File", "DB inspector: delete database file button");
}

export function settingsDbInspectorRowsLabel(count: number) {
  return fbs(
    ["Rows: ", fbs.param("count", count.toString())],
    "DB inspector: table row count"
  );
}

export function settingsDbInspectorNoTablesFound() {
  return fbs("No tables found.", "DB inspector: empty state");
}

export function settingsDbInspectorNewDatabaseButton() {
  return fbs("New Database", "DB inspector: new database button");
}

export function settingsDbInspectorMigrationFailedTitle() {
  return fbs("Migration failed", "DB inspector: migration failed alert title");
}
