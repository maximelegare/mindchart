import { useNotesAndThoughtsController } from "@/api/controllers/useNotesAndThoughtsController";
import { Button, Typography } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/modal/custom/loadingState/loadingState";
import { useModal } from "@/components/ui/modal/modal";
import { useState } from "react";
import { Alert, View } from "react-native";

import fakeData from "@/services/seed/data/mock.json" with { type: "json" };
import { Card } from "@/components/ui/card";
import { Gutter } from "@/components/ui/gutter";

export const SeedDatabase = () => {
  const [numberOfNotes, setNumberOfNotes] = useState("100");
  const { openModal, closeModal } = useModal();
  const { useSeedDatabaseMutation } = useNotesAndThoughtsController();
  const { mutateAsync: seedDatabaseAsync } = useSeedDatabaseMutation();

  const seedDatabase = async () => {
    if (numberOfNotes === "") {
      Alert.alert("Please enter a number of notes");
      return;
    }
    openModal({
      dismissOnBackgroundPress: false,
      customContent: () => (
        <LoadingState title="Seeding Database" size="large" />
      ),
    });
    try {
      await seedDatabaseAsync(parseInt(numberOfNotes));
    } catch (error) {
      console.error(error);
    } finally {
      closeModal();
    }
  };

  return (
    <Card>
      <Gutter size="md" className="py-2">
        <Typography variant="h3" padding>
          Seed Database
        </Typography>
        <Typography variant="p" padding>
          Seed the database with a certain number of notes{" "}
        </Typography>
        <Typography variant="p" padding>
          Max number of notes: {fakeData.length}
        </Typography>
        <View className="flex-row gap-2">
          <Button variant="default" onPress={() => seedDatabase()}>
            <Typography>Seed</Typography>
          </Button>
          <Input
            style={{ width: 100 }}
            placeholder="Number of notes"
            keyboardType="number-pad"
            value={numberOfNotes}
            onChangeText={setNumberOfNotes}
          />
        </View>
      </Gutter>
    </Card>
  );
};
