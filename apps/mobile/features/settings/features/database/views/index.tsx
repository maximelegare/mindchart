import React from "react";
import List from "@/components/ui/list";
import ListItem from "@/components/ui/list-item";
import { Icon } from "@/components/ui/icons/icon";
import { useRouter } from "expo-router";

import { DatabaseBackupFeature } from "../backup/views";

export const DatabaseSettingsFeature = () => {
  const { push } = useRouter();

  return (
    <List>
      <DatabaseBackupFeature />
      <ListItem
        className="bg-background"
        itemLeft={() => <Icon name="square-mouse-pointer" color="foreground" />}
        label="DB Inspector"
        onPress={() => push("/settings/database/inspector")}
      />
    </List>
  );
};
