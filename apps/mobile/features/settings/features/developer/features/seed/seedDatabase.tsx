import { useNotesAndThoughtsController } from "@/api/controllers/useNotesAndThoughtsController";
import { Button, Span, Typography } from "@/components/ui";
import { Input } from "@/components/ui/input";
import { LoadingState } from "@/components/ui/modal/custom/loadingState/loadingState";
import { useModal } from "@/components/ui/modal/modal";
import { useState } from "react";
import { Alert, StyleProp, View, ViewStyle } from "react-native";

import fakeData from "@/seed/data/mock.json" with { type: "json" };
import { Card } from "@/components/ui/card";
import { Gutter } from "@/components/ui/gutter";
import { cn } from "@/lib/cn";

export const SeedDatabaseFeature = ({
  className,
  style,
}: {
  className?: string;
  style?: StyleProp<ViewStyle>;
}) => {
  const [numberOfNotes, setNumberOfNotes] = useState(
    fakeData.length.toString()
  );
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
    <Card className={cn(className)} style={style}>
      <Gutter size="md" className="py-2">
        <Typography variant="h3" padding>
          Seed Database
        </Typography>
        <Typography variant="p" padding className="mb-2">
          Fill the database with fake data for testing. The maximum number of
          notes is <Span className="font-bold">{fakeData.length}</Span>.
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
