import { Pressable, View } from "react-native";
import { Icon } from "@/components/ui/icons/icon";
import { Typography } from "@/components/ui/typography";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { APP_PIN_LENGTH } from "../constants";

type PinDotsProps = {
  length?: number;
  filledCount: number;
  variant?: "circle" | "square";
};

export function PinDots({
  length = APP_PIN_LENGTH,
  filledCount,
  variant = "square",
}: PinDotsProps) {
  const { colorScheme } = useColorScheme();

  return (
    <View className="flex-row mb-4 gap-2 justify-center">
      {[...Array(length)].map((_, index) => {
        const isActive = index === filledCount;
        const isFilled = index < filledCount;

        if (variant === "circle") {
          return (
            <View
              key={index}
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: isFilled
                  ? hsl("primary", colorScheme)
                  : hsl("muted", colorScheme),
              }}
            />
          );
        }

        return (
          <View
            key={index}
            className="w-10 h-10 rounded-lg border items-center justify-center"
            style={{
              borderColor: isActive
                ? hsl("primary", colorScheme)
                : hsl("border", colorScheme),
            }}
          >
            <View
              className="w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor: isFilled
                  ? hsl("foreground", colorScheme)
                  : "transparent",
              }}
            />
          </View>
        );
      })}
    </View>
  );
}

type PinPadProps = {
  onDigit: (digit: string) => void;
  onDelete: () => void;
  onBiometric?: () => void;
  showBiometric?: boolean;
  variant?: "circle" | "rect";
};

export function PinPad({
  onDigit,
  onDelete,
  onBiometric,
  showBiometric = false,
  variant = "rect",
}: PinPadProps) {
  const { colorScheme } = useColorScheme();
  const keys =
    variant === "circle"
      ? [
          ["1", "2", "3"],
          ["4", "5", "6"],
          ["7", "8", "9"],
          ["fingerprint", "0", "del"],
        ]
      : [
          ["1", "2", "3"],
          ["4", "5", "6"],
          ["7", "8", "9"],
          ["", "0", "del"],
        ];

  const keySizeStyle =
    variant === "circle"
      ? { width: 65, height: 65, marginHorizontal: 16, marginVertical: 4 }
      : { width: 90, height: 55, marginHorizontal: 4, marginVertical: 4 };

  return (
    <View>
      {keys.map((row, rowIndex) => (
        <View key={rowIndex} className="flex-row mb-1 justify-center">
          {row.map((key, colIndex) => {
            if (key === "" || (key === "fingerprint" && !showBiometric)) {
              return <View key={colIndex} style={keySizeStyle} />;
            }

            return (
              <Pressable
                key={colIndex}
                style={[
                  keySizeStyle,
                  {
                    borderRadius: variant === "circle" ? 999 : 12,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: hsl("muted", colorScheme),
                  },
                ]}
                onPress={() => {
                  if (key === "del") onDelete();
                  else if (key === "fingerprint") onBiometric?.();
                  else onDigit(key);
                }}
              >
                {key === "del" ? (
                  <Typography variant="p" padding={false}>
                    ⌫
                  </Typography>
                ) : key === "fingerprint" ? (
                  <Icon name="key-round" color="foreground" size={24} />
                ) : (
                  <Typography variant="h3" padding={false}>
                    {key}
                  </Typography>
                )}
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}
