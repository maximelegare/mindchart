import { fbs } from "fbtee";

export function SettingsPageTitle() {
  return <fbt desc="Settings page title">Settings</fbt>;
}

export function settingsPageTitleString() {
  return fbs("Settings", "Settings page title");
}

export function SettingsAppearanceSectionTitle() {
  return <fbt desc="Settings section: appearance">Appearance</fbt>;
}

export function SettingsAboutSectionTitle() {
  return <fbt desc="Settings section: about">About</fbt>;
}

export function SettingsDeveloperSectionTitle() {
  return <fbt desc="Settings section: developer">Developer</fbt>;
}

export function settingsDeveloperOptionsLabel() {
  return fbs("Developer Options", "Settings row: developer options");
}

export function SettingsLanguageSectionTitle() {
  return <fbt desc="Settings section: language">Language</fbt>;
}

export function settingsLanguageRowLabel() {
  return fbs("Language", "Settings row: language");
}

export function SettingsSelectLanguageSheetTitle() {
  return <fbt desc="Language picker sheet title">Select language</fbt>;
}

export function settingsThemeRowLabel() {
  return fbs("Theme", "Settings row: theme");
}

export function SettingsSelectThemeSheetTitle() {
  return <fbt desc="Theme picker sheet title">Select Theme</fbt>;
}

export function settingsAppVersionLabel() {
  return fbs("App Version", "Settings row: app version");
}

export function settingsDeveloperOptionsPageTitle() {
  return fbs("Developer Options", "Developer settings page title");
}

export function settingsDeveloperPageSubtitle() {
  return fbs("Settings", "Developer settings page subtitle");
}

export function settingsDbInspectorPageTitle() {
  return fbs("SQLite Inspector", "DB inspector page title");
}

export function settingsDbInspectorPageSubtitle() {
  return fbs("Settings / Developer Options", "DB inspector page subtitle");
}

export function settingsDbInspectorRowLabel() {
  return fbs("DB Inspector", "Developer settings row: DB inspector");
}

export function settingsStatusLoaded() {
  return fbs("Loaded", "Settings status: model loaded");
}

export function settingsStatusSetup() {
  return fbs("Setup", "Settings status: setup required");
}

export function settingsStatusSetupRequired() {
  return fbs(
    "*** Setup Required ***",
    "Settings status: setup required emphasis"
  );
}

export function settingsStatusEnabled() {
  return fbs("Enabled", "Settings status: enabled");
}

export function settingsStatusDisabled() {
  return fbs("Disabled", "Settings status: disabled");
}

export function settingsStatusNone() {
  return fbs("None", "Settings status: none selected");
}

export function settingsStatusSelected() {
  return fbs("Selected", "Settings row: selected option");
}

export function settingsActionCancel() {
  return fbs("Cancel", "Settings action: cancel");
}

export function settingsActionCreate() {
  return fbs("Create", "Settings action: create");
}

export function settingsActionSave() {
  return fbs("Save", "Settings action: save");
}

export function settingsActionEnable() {
  return fbs("Enable", "Settings action: enable");
}

export function settingsActionSeed() {
  return fbs("Seed", "Developer settings: seed database button");
}

export function settingsActionClearSeed() {
  return fbs("Clear seed", "Developer settings: clear seed data button");
}

export function settingsActionDelete() {
  return fbs("Delete", "Settings action: delete");
}

export function settingsActionImport() {
  return fbs("Import", "Workspaces: import button");
}

export function settingsActionNew() {
  return fbs("New", "Workspaces: new workspace button");
}

export function settingsCommonUnknownError() {
  return fbs("Unknown error", "Generic unknown error message");
}
