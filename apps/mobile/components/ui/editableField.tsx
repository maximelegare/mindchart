import { StyleProp, TextStyle } from "react-native";
import { Textarea } from "./textarea";
import { cn } from "@/lib/cn";
import { BottomSheetTextInput } from "@gorhom/bottom-sheet";

type EditableFieldProps = {
  onChange: (text: string) => void;
  value: string;
  id: string;
  title: string;
  fontSize?: "sm" | "md" | "lg";
  className?: string;
  style?: StyleProp<TextStyle>;
  fontFamily?: "QuicksandRegular" | "QuicksandBold";
  numberOfLines?: number;
  inBottomSheet?: boolean;
  placeholder?: string;
};

export const EditableField = ({
  value,
  id,
  onChange,
  title,
  fontSize = "sm",
  className,
  style = {},
  fontFamily = "QuicksandBold",
  numberOfLines = 4,
  inBottomSheet = false,
  placeholder = "Enter text",
}: EditableFieldProps) => {
  return inBottomSheet ? (
    <BottomSheetTextInput
      numberOfLines={numberOfLines}
      className={cn(
        "bg-transparent border-transparent p-0 text-2xl m-0",
        className
      )}
      aria-labelledby={title}
      style={{
        fontFamily: fontFamily,
        fontSize: fontSize === "sm" ? 16 : fontSize === "md" ? 18 : 20,
        textAlignVertical: "top", // <--- Add this line
        minHeight: 20, // Ensure it has enough room to show text
        ...(style as TextStyle),
      }}
      nativeID={id}
      onChangeText={onChange}
      value={value}
      multiline
      placeholder={placeholder}
    />
  ) : (
    <Textarea
      numberOfLines={numberOfLines}
      className={cn(
        "bg-transparent border-transparent p-0 text-2xl m-0",
        className
      )}
      aria-labelledby={title}
      style={{
        fontFamily: fontFamily,
        fontSize: fontSize === "sm" ? 16 : fontSize === "md" ? 18 : 20,
        textAlignVertical: "top", // <--- Add this line
        minHeight: 20, // Ensure it has enough room to show text
        ...(style as TextStyle),
      }}
      nativeID={id}
      onChangeText={onChange}
      value={value}
      multiline
      placeholder={placeholder}
    />
  );
};
