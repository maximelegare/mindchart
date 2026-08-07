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
  BottomSheetCloseTrigger,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetOpenTrigger,
  BottomSheetView,
} from "@/components/primitives/bottomSheet/bottom-sheet.native";
import { Typography } from "@/components/ui";
import { Button } from "@/components/ui/button";
import { Check } from "@/lib/icons/Check";
import { useBottomSheetModal } from "@gorhom/bottom-sheet";
import { useColorScheme } from "@/lib/useColorScheme";
import { Person } from "@repo/zod-schemas";
import { hsl } from "@/utils/hsl";
import { cn } from "@/lib/cn";
import { useControllers } from "@/api/controllers/useControllers";
import { Icon } from "@/components/ui/icons/icon";
import { X } from "@/lib/icons/Times";
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
  const [contactsGranted, setContactsGranted] = useState<boolean | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [hasSyncedThisOpen, setHasSyncedThisOpen] = useState(false);

  const selectedIds = useMemo(
    () => new Set(selectedPersons.map((person) => person.id)),
    [selectedPersons]
  );

  const filteredPersons = useMemo(() => {
    const query = search.trim().toLowerCase();
    return persons.filter((person) => {
      if (selectedIds.has(person.id)) return false;
      if (!query) return true;
      return person.name.toLowerCase().includes(query);
    });
  }, [persons, search, selectedIds]);

  const label = useMemo(() => {
    if (selectedPersons.length === 0) return "";
    const names = selectedPersons.map((person) => person.name).join(", ");
    if (maxChars != null && maxChars > 0 && names.length > maxChars) {
      return `${names.slice(0, maxChars)}…`;
    }
    return names;
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

  const handlePersonCreated = async (person: Person) => {
    await insertPerson({ data: person });
    onChange([...selectedPersons, person]);
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
          {selectedPersons.length === 0 ? (
            <Icon name="plus" color="foreground" size={16} />
          ) : null}
        </TouchableOpacity>
      </BottomSheetOpenTrigger>
      <BottomSheetContent
        style={{ zIndex: 100 }}
        enablePanDownToClose
        enableContentPanningGesture={false}
        enableDynamicSizing={false}
        snapPoints={["100%"]}
      >
        <BottomSheetView className="h-full flex-1 gap-4 bg-background px-4 pb-6 pt-4">
          <BottomSheetHeader className="bg-background">
            <Typography variant="h3" className="pb-1 text-foreground">
              Add People
            </Typography>
          </BottomSheetHeader>

          {contactsGranted === false ? (
            <Typography className="text-sm text-muted-foreground">
              Contacts access was denied. Add people with +.
            </Typography>
          ) : null}

          <View className="flex-row items-center gap-2">
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search people"
              placeholderTextColor={hsl("muted-foreground", colorScheme)}
              className="min-w-0 flex-1 rounded-full border border-input bg-card px-4 py-2 text-foreground"
            />
            <AddPersonSheet onPersonCreated={handlePersonCreated} />
          </View>

          {selectedPersons.length > 0 ? (
            <View className="gap-1">
              <Typography variant="small" className="text-muted-foreground">
                Selected ({selectedPersons.length})
              </Typography>
              <ScrollView
                nestedScrollEnabled
                showsVerticalScrollIndicator
                style={{ maxHeight: 192 }}
              >
                <View className="w-full flex-col gap-1 pb-2">
                  {selectedPersons.map((person) => (
                    <PersonItem
                      key={`selected-${person.id}`}
                      item={person}
                      selected
                      onPress={() => togglePerson(person)}
                      trailing={
                        <Button
                          variant="ghost"
                          size="sm"
                          accessibilityRole="button"
                          accessibilityLabel={`Remove ${person.name}`}
                          onPress={() => togglePerson(person)}
                        >
                          <X className="text-muted-foreground" size={20} />
                        </Button>
                      }
                    />
                  ))}
                </View>
              </ScrollView>
            </View>
          ) : null}
          <View className="my-2 h-px w-full bg-border" />
          <ScrollView className="min-h-0 flex-1">
            <View className="w-full flex-col gap-2">
              {filteredPersons.map((person) => (
                <PersonItem
                  key={person.id}
                  item={person}
                  selected={false}
                  onPress={() => togglePerson(person)}
                />
              ))}
              {!syncing && filteredPersons.length === 0 ? (
                <Typography className="py-4 text-center text-muted-foreground">
                  {persons.length === 0
                    ? "No people yet. Tap + to add someone."
                    : "No more people to add."}
                </Typography>
              ) : null}
            </View>
          </ScrollView>
          <View className="mb-2 h-px w-full bg-border" />
          <View className="items-center justify-center">
            <BottomSheetCloseTrigger asChild>
              <Button variant="ghost" className="bg-popover">
                <Typography className="text-background">Close</Typography>
              </Button>
            </BottomSheetCloseTrigger>
          </View>
        </BottomSheetView>
      </BottomSheetContent>
    </BottomSheet>
  );
};

function AddPersonSheet({
  onPersonCreated,
}: {
  onPersonCreated: (person: Person) => Promise<void>;
}) {
  const { colorScheme } = useColorScheme();
  const { dismiss } = useBottomSheetModal();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    const trimmed = name.trim();
    if (!trimmed || saving) return;

    setSaving(true);
    try {
      await onPersonCreated({
        id: generateID(),
        name: trimmed,
        contactId: null,
        createdAt: new Date().toISOString(),
      });
      setName("");
      dismiss();
    } finally {
      setSaving(false);
    }
  };

  return (
    <BottomSheet>
      <BottomSheetOpenTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          accessibilityRole="button"
          accessibilityLabel="Add person"
        >
          <Icon name="plus" color="foreground" size={20} />
        </Button>
      </BottomSheetOpenTrigger>
      <BottomSheetContent
        style={{ zIndex: 110 }}
        enablePanDownToClose
        enableContentPanningGesture={false}
        enableDynamicSizing={false}
        snapPoints={["100%"]}
      >
        <BottomSheetView className="gap-4 h-full bg-background">
          <BottomSheetHeader className="bg-background">
            <Typography variant="h3" className="pb-1 text-foreground">
              Create Contact
            </Typography>
          </BottomSheetHeader>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="Name"
            autoFocus
            placeholderTextColor={hsl("muted-foreground", colorScheme)}
            className="rounded-lg border border-input bg-card px-3 py-2 text-foreground"
            onSubmitEditing={() => {
              void handleAdd();
            }}
          />
          <Button
            variant="default"
            onPress={handleAdd}
            disabled={!name.trim() || saving}
          >
            <Typography className="font-semibold text-primary-foreground">
              Add
            </Typography>
          </Button>
        </BottomSheetView>
      </BottomSheetContent>
    </BottomSheet>
  );
}

function PersonItem({
  item,
  onPress,
  selected,
  trailing,
}: {
  item: Person;
  onPress: () => void;
  selected: boolean;
  trailing?: React.ReactNode;
}) {
  return (
    <Pressable
      className={cn("w-full rounded-lg px-2 py-4", selected && "bg-border")}
      onPress={onPress}
    >
      <View className="flex-row items-center justify-between gap-2">
        <View className="min-w-0 flex-1">
          <Typography>{item.name}</Typography>
        </View>
        {trailing ??
          (selected ? <Check className="text-accent-foreground" /> : null)}
      </View>
    </Pressable>
  );
}
