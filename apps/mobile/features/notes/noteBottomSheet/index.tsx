import React, { useCallback, useState } from "react";
import { TouchableOpacity, View } from "react-native";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetOpenTrigger,
  BottomSheetView,
  useBottomSheet,
} from "@/components/primitives/bottomSheet/bottom-sheet.native";
import { Icon } from "@/components/ui/icons/icon";
import { Typography } from "@/components/ui";
import { EditNoteFeature } from "@/features/notes/editNote/views";
import { useEditNote } from "@/features/notes/editNote/hooks/useEditNote";
import { EditNote } from "./components/editNote";
import { DeleteNote } from "./components/deleteNote";

type NoteBottomSheetProps = {
  noteId: string;
};

export const NoteBottomSheet = ({ noteId }: NoteBottomSheetProps) => {
  const { editNoteAction } = useEditNote();
  const editSheet = useBottomSheet();
  const [editOpen, setEditOpen] = useState(false);

  const openEditSheet = useCallback(() => {
    setEditOpen(true);
    setTimeout(() => {
      editSheet.open();
    }, 200);
  }, [editSheet]);

  return (
    <>
      <BottomSheet>
        <BottomSheetOpenTrigger asChild className="w-fit">
          <TouchableOpacity className="rounded-full flex-row items-center gap-2 w-fit">
            <Icon name="ellipsis-vertical" color="text" size={20} />
          </TouchableOpacity>
        </BottomSheetOpenTrigger>
        <BottomSheetContent
          style={{ zIndex: 100 }}
          enablePanDownToClose={true}
          enableContentPanningGesture={false}
        >
          <BottomSheetView className="gap-3 pt-6 bg-background">
            <EditNote onPress={openEditSheet} />
            <DeleteNote noteId={noteId} />
          </BottomSheetView>
        </BottomSheetContent>
      </BottomSheet>

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
