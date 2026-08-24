import { SeedDatabaseFeature } from "../features/seed/seedDatabase";

export const DeveloperSettingsFeature = () => {
  return (
    <>
      <SeedDatabaseFeature style={{ marginBottom: 20 }} />
      {/* <List>
        <ListItem
          className="bg-background"
          itemLeft={() => (
            <Icon name="square-mouse-pointer" color="foreground" />
          )}
          label={settingsDbInspectorRowLabel()}
          onPress={() => push("/settings/developer/inspector")}
        />
      </List> */}
    </>
  );
};
