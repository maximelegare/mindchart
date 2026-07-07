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

  const { categories, topics } = useControllers();
  const { useFetchAllCategoriesQuery } = categories;
  const { useFetchAllTopicsQuery } = topics;

  const { data: categoriesData } = useFetchAllCategoriesQuery();
  const { data: topicsData } = useFetchAllTopicsQuery();

  const handleSuccess = React.useCallback(() => {
    setFormKey((key) => key + 1);
    onSuccess?.();
  }, [onSuccess]);

  const { saveManualNote } = useSaveManualNote(handleSuccess);

  if (!topicsData?.length) {
    return (
      <View className="flex-1 items-center justify-center px-6">
        <Typography className="text-center text-muted-foreground">
          Add a topic first in Manage Topics before creating a manual note.
        </Typography>
      </View>
    );
  }

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
    <ManualNoteForm
      key={formKey}
      noteId={noteId}
      defaultTopic={topicsData[0]}
      categories={categoriesData}
      onSubmit={saveManualNote}
    />
  );
}
