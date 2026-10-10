import React, { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Icon } from "@/components/ui/icons/icon";
import { Typography } from "@/components/ui/typography";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { LAYOUT_SIZES } from "@/components/layout/constants";
import { useToastStore, type ToastItem } from "./toastStore";

function ToastCard({ item }: { item: ToastItem }) {
  const { colorScheme } = useColorScheme();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;
  const dismiss = useToastStore((state) => state.dismiss);
  const isError = item.variant === "error";

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();

    const timeout = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 8,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start(() => dismiss(item.id));
    }, item.duration);

    return () => clearTimeout(timeout);
  }, [dismiss, item.duration, item.id, opacity, translateY]);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity,
          transform: [{ translateY }],
          backgroundColor: hsl("card", colorScheme),
          borderColor: hsl("border", colorScheme),
        },
      ]}
    >
      <Pressable
        onPress={() => dismiss(item.id)}
        accessibilityRole="button"
        style={styles.pressable}
      >
        <Icon
          name={isError ? "circle-x" : "circle-check"}
          size={18}
          color={isError ? "foreground-errors" : "primary"}
        />
        <View style={styles.copy}>
          <Typography variant="small" className="pb-0">
            {item.title}
          </Typography>
          {item.description ? (
            <Typography variant="muted" className="pb-0">
              {item.description}
            </Typography>
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function ToastHost() {
  const insets = useSafeAreaInsets();
  const toasts = useToastStore((state) => state.toasts);

  if (toasts.length === 0) return null;

  return (
    <View
      pointerEvents="box-none"
      style={[
        styles.host,
        {
          paddingBottom: insets.bottom + LAYOUT_SIZES.TAB_BAR_HEIGHT + 8,
        },
      ]}
    >
      {toasts.map((item) => (
        <ToastCard key={item.id} item={item} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  host: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000,
    elevation: 1000,
    alignItems: "center",
    justifyContent: "flex-end",
    paddingHorizontal: 16,
    gap: 8,
  },
  card: {
    width: "100%",
    maxWidth: 420,
    borderRadius: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  pressable: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
});
