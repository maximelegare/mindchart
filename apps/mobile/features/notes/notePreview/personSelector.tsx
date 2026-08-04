import React, { useCallback, useMemo, useState } from "react";
import {
  Pressable,
  ScrollView,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetOpenTrigger,
  BottomSheetView,
} from "@/components/primitives/bottomSheet/bottom-sheet.native";
import { Typography } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Check } from "@/lib/icons/Check";
import { useColorScheme } from "@/lib/useColorScheme";
import { Person } from "@repo/zod-schemas";
import { hsl } from "@/utils/hsl";
import { useControllers } from "@/api/controllers/useControllers";
import { Icon } from "@/components/ui/icons/icon";
import { useSyncContacts } from "@/features/persons/hooks/useSyncContacts";
import { generateID } from "@/utils/genrateID";

export const PersonSelector = ({
  selectedPersons,
  onChange,
  maxChars = 22,
}: {
  selectedPersons: Person[];
  onChange: (persons: Person[]) => void;
  maxChars?: number;
}) => {
  const { useFetchAllPersonsQuery, useInsertPersonMutation } =
    useControllers().persons;
  const { data: persons = [], refetch } = useFetchAllPersonsQuery();
  const { mutateAsync: insertPerson } = useInsertPersonMutation();
  const { syncContacts } = useSyncContacts();
  const { colorScheme } = useColorScheme();

  const [search, setSearch] = useState("");
  const [manualName, setManualName] = useState("");
  const [contactsGranted, setContactsGranted] = useState<boolean | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [hasSyncedThisOpen, setHasSyncedThisOpen] = useState(false);

  const selectedIds = useMemo(
    () => new Set(selectedPersons.map((person) => person.id)),
    [selectedPersons]
  );

  const filteredPersons = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return persons;
    return persons.filter((person) =>
      person.name.toLowerCase().includes(query)
    );
  }, [persons, search]);

  const label = useMemo(() => {
    if (selectedPersons.length === 0) return "People";
    if (selectedPersons.length === 1) {
      const name = selectedPersons[0].name;
      return maxChars && name.length > maxChars
        ? `${name.slice(0, maxChars)}…`
        : name;
    }
    return `${selectedPersons.length} people`;
  }, [maxChars, selectedPersons]);

  const syncOnOpen = useCallback(async () => {
    if (hasSyncedThisOpen || syncing) return;
    setSyncing(true);
    try {
      const granted = await syncContacts();
      setContactsGranted(granted);
      setHasSyncedThisOpen(true);
      if (granted) {
        await refetch();
      }
    } finally {
      setSyncing(false);
    }
  }, [hasSyncedThisOpen, refetch, syncContacts, syncing]);

  const togglePerson = (person: Person) => {
    if (selectedIds.has(person.id)) {
      onChange(selectedPersons.filter((item) => item.id !== person.id));
      return;
    }
    onChange([...selectedPersons, person]);
  };

  const handleAddManual = async () => {
    const name = manualName.trim();
    if (!name) return;

    const person: Person = {
      id: generateID(),
      name,
      contactId: null,
      phone: null,
      email: null,
      createdAt: new Date().toISOString(),
    };

    await insertPerson({ data: person });
    onChange([...selectedPersons, person]);
    setManualName("");
    await refetch();
  };

  return (
    <BottomSheet>
      <BottomSheetOpenTrigger
        asChild
        className="self-start"
        onPress={() => {
          void syncOnOpen();
        }}
      >
        <TouchableOpacity className="flex-row items-center gap-1.5 self-start rounded-full bg-card px-2.5 py-1.5">
          <Icon name="user-round" color="foreground" size={16} />
          <Typography
            variant="p"
            className="shrink text-foreground"
            numberOfLines={1}
          >
            {label}
          </Typography>
        </TouchableOpacity>
      </BottomSheetOpenTrigger>
      <BottomSheetContent
        style={{ zIndex: 100 }}
        enablePanDownToClose={true}
        enableContentPanningGesture={false}
        enableDynamicSizing={false}
        snapPoints={["55%"]}
      >
        <BottomSheetView
          className="gap-4 bg-background pt-6"
          style={{ left: 19 }}
        >
          <BottomSheetHeader className="bg-background">
            <Typography className="pb-1 text-xl font-bold text-foreground">
              People
            </Typography>
          </BottomSheetHeader>

          {contactsGranted === false ? (
            <Typography className="text-sm text-muted-foreground">
              Contacts access was denied. Add people manually below.
            </Typography>
          ) : null}

          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search people"
            placeholderTextColor={hsl("muted-foreground", colorScheme)}
            className="rounded-lg border border-input bg-card px-3 py-2 text-foreground"
          />

          <ScrollView style={{ maxHeight: 260 }}>
            <View className="w-full flex-col gap-2">
              {filteredPersons.map((person) => (
                <PersonItem
                  key={person.id}
                  item={person}
                  selected={selectedIds.has(person.id)}
                  onPress={() => togglePerson(person)}
                />
              ))}
              {!syncing && filteredPersons.length === 0 ? (
                <Typography className="py-4 text-center text-muted-foreground">
                  No people yet. Add someone below.
                </Typography>
              ) : null}
            </View>
          </ScrollView>

          <View className="flex-row items-center gap-2">
            <TextInput
              value={manualName}
              onChangeText={setManualName}
              placeholder="Add person manually"
              placeholderTextColor={hsl("muted-foreground", colorScheme)}
              className="min-w-0 flex-1 rounded-lg border border-input bg-card px-3 py-2 text-foreground"
            />
            <Button
              variant="outline"
              size="sm"
              onPress={handleAddManual}
              disabled={!manualName.trim()}
            >
              <Typography className="font-semibold text-foreground">
                Add
              </Typography>
            </Button>
          </View>
        </BottomSheetView>
      </BottomSheetContent>
    </BottomSheet>
  );
};

function PersonItem({
  item,
  onPress,
  selected,
}: {
  item: Person;
  onPress: () => void;
  selected: boolean;
}) {
  const { colorScheme } = useColorScheme();
  return (
    <Pressable
      className="w-full rounded-lg border border-solid px-2 py-4"
      style={{
        borderColor: selected ? hsl("border", colorScheme) : "transparent",
      }}
      onPress={onPress}
    >
      <View className="flex-row items-center justify-between gap-2">
        <View className="min-w-0 flex-1">
          <Typography>{item.name}</Typography>
          {item.phone || item.email ? (
            <Typography className="text-sm text-muted-foreground">
              {[item.phone, item.email].filter(Boolean).join(" · ")}
            </Typography>
          ) : null}
        </View>
        {selected ? <Check className="text-accent-foreground" /> : null}
      </View>
    </Pressable>
  );
}
