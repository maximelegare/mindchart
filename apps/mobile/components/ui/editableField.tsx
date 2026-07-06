import * as React from "react";
import {
  StyleProp,
  TextInput,
  TextStyle,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
} from "react-native";
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
  onInsertNewItem?: () => void;
  onBackspaceAtStart?: () => void;
  multiline?: boolean;
};

export const EditableField = React.forwardRef<TextInput, EditableFieldProps>(
  function EditableField(
    {
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
      onInsertNewItem,
      onBackspaceAtStart,
      multiline = true,
    },
    ref
  ) {
    const inputStyle = {
      fontFamily: fontFamily,
      fontSize: fontSize === "sm" ? 16 : fontSize === "md" ? 18 : 20,
      textAlignVertical: "top" as const,
      minHeight: 20,
      ...(style as TextStyle),
    };

    const handleChangeText = (text: string) => {
      if (onInsertNewItem && text.endsWith("\n")) {
        onChange(text.slice(0, -1));
        onInsertNewItem();
        return;
      }
      onChange(text);
    };

    const handleKeyPress = (
      event: NativeSyntheticEvent<TextInputKeyPressEventData>
    ) => {
      const key = event.nativeEvent.key;

      if (onBackspaceAtStart && key === "Backspace" && value.length === 0) {
        onBackspaceAtStart();
        return;
      }

      if (onInsertNewItem && key === "Tab") {
        onInsertNewItem();
      }
    };

    return inBottomSheet ? (
      <BottomSheetTextInput
        ref={ref as React.Ref<React.ComponentRef<typeof BottomSheetTextInput>>}
        numberOfLines={numberOfLines}
        className={cn(
          "bg-transparent border-transparent p-0 text-2xl m-0",
          className
        )}
        aria-labelledby={title}
        style={inputStyle}
        nativeID={id}
        onChangeText={handleChangeText}
        onKeyPress={handleKeyPress}
        value={value}
        multiline={multiline}
        placeholder={placeholder}
        blurOnSubmit={false}
      />
    ) : (
      <Textarea
        ref={ref}
        numberOfLines={numberOfLines}
        className={cn(
          "bg-transparent border-transparent p-0 text-2xl m-0",
          className
        )}
        aria-labelledby={title}
        style={inputStyle}
        nativeID={id}
        onChangeText={handleChangeText}
        onKeyPress={handleKeyPress}
        value={value}
        multiline={multiline}
        placeholder={placeholder}
        blurOnSubmit={false}
      />
    );
  }
);

EditableField.displayName = "EditableField";
