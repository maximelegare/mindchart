import React from "react";
import { View } from "react-native";
import { Typography } from "@/components/ui";
import { useControllers } from "@/api/controllers/useControllers";
import { generateID } from "@/utils/genrateID";
import { ManualNoteForm } from "../components/manualNoteForm";
import { useSaveManualNote } from "../hooks/useSaveManualNote";

export function ManualModeFeature({ onSuccess }: { onSuccess?: () => void }) {
  const [formKey, setFormKey] = React.useState(0);
  const noteId = React.useMemo(() => generateID(), [formKey]);

  const { categories } = useControllers();
  const { useFetchAllCategoriesQuery } = categories;
  const { data: categoriesData } = useFetchAllCategoriesQuery();

  const handleSuccess = React.useCallback(() => {
    setFormKey((key) => key + 1);
    onSuccess?.();
  }, [onSuccess]);

  const { saveManualNote } = useSaveManualNote(handleSuccess);

  if (!categoriesData?.length) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Typography className="text-center text-muted-foreground">
          Categories are loading...
        </Typography>
      </View>
    );
  }

  return (
    <View className="flex-1 min-h-0">
      <ManualNoteForm
        key={formKey}
        noteId={noteId}
        categories={categoriesData}
        onSubmit={saveManualNote}
      />
    </View>
  );
}
