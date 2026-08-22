import React from "react";
import { ScrollView, View } from "react-native";
import {
  BottomSheet,
  BottomSheetContent,
  BottomSheetHeader,
  BottomSheetOpenTrigger,
  BottomSheetView,
} from "@/components/primitives/bottomSheet/bottom-sheet.native";
import { Button, Typography } from "@/components/ui";
import {
  RawTextButtonLabel,
  RawTextSheetTitle,
} from "@/features/notes/noteDetails/noteDetailsLabels";

export const RawTextViewer = ({ rawText }: { rawText: string }) => {
  return (
    <>
      <BottomSheet>
        <BottomSheetOpenTrigger asChild className="w-fit">
          <Button variant="outline" size="xs" className="px-1">
            <Typography variant="h4">
              <RawTextButtonLabel />
            </Typography>
          </Button>
        </BottomSheetOpenTrigger>
        <BottomSheetContent
          style={{ zIndex: 100 }}
          enablePanDownToClose={true}
          enableContentPanningGesture={false}
        >
          <BottomSheetView
            className="gap-5 pt-6 bg-background"
            style={{ left: 19 }}
          >
            <BottomSheetHeader className="bg-background">
              <Typography variant="h3">
                <RawTextSheetTitle />
              </Typography>
            </BottomSheetHeader>
            <ScrollView style={{ maxHeight: 300 }}>
              <View className="flex flex-col w-full flex-wrap gap-2">
                <Typography variant="p">{rawText}</Typography>
              </View>
            </ScrollView>
          </BottomSheetView>
        </BottomSheetContent>
      </BottomSheet>
    </>
  );
};
