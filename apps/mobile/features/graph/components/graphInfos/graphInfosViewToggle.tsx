import { View } from "react-native";
import { Button } from "@/components/ui";
import { Icon } from "@/components/ui/icons/icon";
import { cn } from "@/lib/cn";
import {
  graphInfosNotesViewAccessibilityLabel,
  graphInfosTreeViewAccessibilityLabel,
} from "./graphInfosLabels";

export type GraphInfosContentView = "tree" | "notes";

export const GraphInfosViewToggle = ({
  view,
  onChange,
}: {
  view: GraphInfosContentView;
  onChange: (view: GraphInfosContentView) => void;
}) => (
  <View className="flex-row items-center">
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-9 w-9 p-0", view === "tree" && "bg-muted")}
      onPress={() => onChange("tree")}
      accessibilityRole="button"
      accessibilityState={{ selected: view === "tree" }}
      accessibilityLabel={graphInfosTreeViewAccessibilityLabel()}
    >
      <Icon
        name="folder-tree"
        color={view === "tree" ? "foreground" : "muted-foreground"}
        size={18}
      />
    </Button>
    <Button
      variant="ghost"
      size="icon"
      className={cn("h-9 w-9 p-0", view === "notes" && "bg-muted")}
      onPress={() => onChange("notes")}
      accessibilityRole="button"
      accessibilityState={{ selected: view === "notes" }}
      accessibilityLabel={graphInfosNotesViewAccessibilityLabel()}
    >
      <Icon
        name="notebook-text"
        color={view === "notes" ? "foreground" : "muted-foreground"}
        size={18}
      />
    </Button>
  </View>
);
