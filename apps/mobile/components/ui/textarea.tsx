import * as React from "react";
import { Platform, TextInput as RNTextInput } from "react-native";
import { TextInput as GestureTextInput } from "react-native-gesture-handler";
import { cn } from "@/lib/cn";

type TextareaProps = React.ComponentPropsWithoutRef<typeof RNTextInput> & {
  placeholderClassName?: string;
};

const Textarea = React.forwardRef<
  React.ElementRef<typeof RNTextInput>,
  TextareaProps
>(
  (
    {
      className,
      multiline = true,
      numberOfLines = 4,
      placeholderClassName,
      ...props
    },
    ref
  ) => {
    const inputClassName = cn(
      "web:flex w-full rounded-md border border-input bg-border px-3 py-2 text-base lg:text-sm native:text-lg native:leading-[1.25] text-foreground web:ring-offset-background placeholder:text-muted-foreground web:focus-visible:outline-none web:focus-visible:ring-2 web:focus-visible:ring-ring web:focus-visible:ring-offset-2",
      props.editable === false && "opacity-50 web:cursor-not-allowed",
      className
    );

    if (Platform.OS === "web") {
      return (
        <RNTextInput
          ref={ref}
          className={inputClassName}
          placeholderClassName={cn(
            "text-muted-foreground",
            placeholderClassName
          )}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlignVertical="top"
          {...props}
        />
      );
    }

    return (
      <GestureTextInput
        ref={ref as React.Ref<React.ComponentRef<typeof GestureTextInput>>}
        className={inputClassName}
        placeholderClassName={cn("text-muted-foreground", placeholderClassName)}
        multiline={multiline}
        numberOfLines={numberOfLines}
        textAlignVertical="top"
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
