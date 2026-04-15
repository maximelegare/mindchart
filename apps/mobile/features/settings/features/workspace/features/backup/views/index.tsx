import { Icon } from "@/components/ui/icons/icon";
import ListItem from "@/components/ui/list-item";
import { useDatabaseBackup } from "../hooks/useDatabaseBackup";

export const DatabaseBackupFeature = () => {
  const { exportDatabase, importDatabase } = useDatabaseBackup();

  return (
    <>
      <ListItem
        className="bg-background"
        itemLeft={() => <Icon name="arrow-up-from-line" color="foreground" />}
        label="Export Database"
        onPress={async () => await exportDatabase()}
        noChevron
      />
      <ListItem
        className="bg-background"
        itemLeft={() => <Icon name="import" color="foreground" />}
        label="Import Database"
        onPress={async () => await importDatabase()}
        noChevron
      />
    </>
  );
};
