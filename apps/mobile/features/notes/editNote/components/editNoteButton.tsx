import React, { useCallback, useState } from "react";
import { View } from "react-native";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetView,
  useBottomSheet,
} from "@/components/primitives/bottomSheet/bottom-sheet.native";
import { Button, Typography } from "@/components/ui";
import { Icon } from "@/components/ui/icons/icon";
import { EditNoteFeature } from "@/features/notes/editNote/views";
import { useEditNote } from "@/features/notes/editNote/hooks/useEditNote";

type EditNoteButtonProps = {
  noteId: string;
};

export const EditNoteButton = ({ noteId }: EditNoteButtonProps) => {
  const { editNoteAction } = useEditNote();
  const editSheet = useBottomSheet();
  const [editOpen, setEditOpen] = useState(false);

  const openEditSheet = useCallback(() => {
    setEditOpen(true);
    setTimeout(() => {
      editSheet.open();
    }, 50);
  }, [editSheet]);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        accessibilityLabel="Edit note"
        onPress={openEditSheet}
      >
        <Icon name="pencil" size={22} color="background" />
      </Button>

      <BottomSheet>
        <BottomSheetContent
          ref={editSheet.ref}
          snapPoints={["100%"]}
          index={0}
          enableContentPanningGesture={false}
          enablePanDownToClose={false}
        >
          {editOpen ? (
            <BottomSheetView className="flex-1 gap-5 pt-6 bg-background h-full">
              <BottomSheetHeader
                className="bg-background gap-2"
                onDismiss={() => setEditOpen(false)}
              >
                <View className="flex-row justify-start items-center gap-2">
                  <Icon name="pencil" color="foreground" />
                  <Typography variant="h3">Edit Note</Typography>
                </View>
              </BottomSheetHeader>
              <EditNoteFeature
                noteId={noteId}
                setOpen={setEditOpen}
                onAction={editNoteAction}
              />
            </BottomSheetView>
          ) : null}
        </BottomSheetContent>
      </BottomSheet>
    </>
  );
};
