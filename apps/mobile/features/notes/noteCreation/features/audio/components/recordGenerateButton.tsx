import React, { useEffect } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import Animated, {
  Easing,
  cancelAnimation,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { Icon } from "@/components/ui/icons/icon";
import { Typography } from "@/components/ui/typography";
import { Gradient } from "@/components/ui/gradient";
import { useColorScheme } from "@/lib/useColorScheme";
import { hsl } from "@/utils/hsl";
import { cn } from "@/lib/cn";
import { useGenerateNoteAction } from "@/features/notes/noteCreation/features/generateNote/hooks/useGenerateNoteAction";

const RECORD_SIZE = 72;
const GENERATE_HEIGHT = 40;
const GENERATE_WIDTH = 148;
const MORPH_MS = 380;
const PULSE_MS = 1100;

type RecordGenerateButtonProps = {
  fileURI: string | null;
  isRecording: boolean;
  isTransitioning?: boolean;
  disabled?: boolean;
  onStartRecording: () => Promise<void>;
  onStopRecording: () => Promise<void>;
  onGenerateSuccess?: () => void;
};

export const RecordGenerateButton = ({
  fileURI,
  isRecording,
  isTransitioning,
  disabled,
  onStartRecording,
  onStopRecording,
  onGenerateSuccess,
}: RecordGenerateButtonProps) => {
  const { colorScheme } = useColorScheme();
  const { generateNote } = useGenerateNoteAction({
    fileURI,
    inputText: "",
    currentView: "audio",
    onSuccess: onGenerateSuccess,
  });

  const isGenerateMode = !!fileURI && !isRecording;
  const morph = useSharedValue(isGenerateMode ? 1 : 0);
  const recordingProgress = useSharedValue(isRecording ? 1 : 0);
  const pulse = useSharedValue(0);
  const recordingColor = hsl("destructive-foreground", "theme", colorScheme);

  useEffect(() => {
    morph.value = withTiming(isGenerateMode ? 1 : 0, {
      duration: MORPH_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [isGenerateMode, morph]);

  useEffect(() => {
    recordingProgress.value = withTiming(isRecording ? 1 : 0, {
      duration: 220,
      easing: Easing.out(Easing.cubic),
    });
  }, [isRecording, recordingProgress]);

  useEffect(() => {
    if (isRecording) {
      pulse.value = 0;
      pulse.value = withRepeat(
        withTiming(1, {
          duration: PULSE_MS,
          easing: Easing.out(Easing.ease),
        }),
        -1,
        false
      );
      return;
    }

    cancelAnimation(pulse);
    pulse.value = withTiming(0, { duration: 160 });
  }, [isRecording, pulse]);

  const containerStyle = useAnimatedStyle(() => ({
    width: interpolate(morph.value, [0, 1], [RECORD_SIZE, GENERATE_WIDTH]),
    height: interpolate(morph.value, [0, 1], [RECORD_SIZE, GENERATE_HEIGHT]),
    borderRadius: interpolate(
      morph.value,
      [0, 1],
      [RECORD_SIZE / 2, GENERATE_HEIGHT / 2]
    ),
  }));

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      pulse.value,
      [0, 1],
      [0.4 * recordingProgress.value, 0]
    ),
    transform: [
      {
        scale: interpolate(pulse.value, [0, 1], [1, 1.65]),
      },
    ],
  }));

  const idleGradientStyle = useAnimatedStyle(() => ({
    opacity:
      (1 - recordingProgress.value) *
      interpolate(morph.value, [0, 0.45, 1], [1, 0.35, 0]),
  }));

  const recordingFillStyle = useAnimatedStyle(() => ({
    opacity:
      recordingProgress.value * interpolate(morph.value, [0, 0.35], [1, 0]),
  }));

  const generateLayerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(morph.value, [0, 0.45, 1], [0, 0.35, 1]),
  }));

  const recordContentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(morph.value, [0, 0.35], [1, 0]),
    transform: [{ scale: interpolate(morph.value, [0, 0.35], [1, 0.85]) }],
  }));

  const generateContentStyle = useAnimatedStyle(() => ({
    opacity: interpolate(morph.value, [0.4, 1], [0, 1]),
    transform: [{ scale: interpolate(morph.value, [0.4, 1], [0.9, 1]) }],
  }));

  const handlePress = async () => {
    if (disabled || isTransitioning) return;

    if (isGenerateMode) {
      await generateNote();
      return;
    }

    if (!isRecording) await onStartRecording();
    else await onStopRecording();
  };

  return (
    <View style={styles.wrap}>
      <Animated.View
        pointerEvents="none"
        style={[styles.pulse, { backgroundColor: recordingColor }, pulseStyle]}
      />

      <Pressable
        onPress={handlePress}
        disabled={disabled || !!isTransitioning}
        accessibilityRole="button"
        accessibilityLabel={
          isGenerateMode
            ? "Generate note"
            : isRecording
              ? "Stop recording"
              : "Start recording"
        }
      >
        <Animated.View
          className={cn(
            "overflow-hidden border-2 border-border",
            (disabled || isTransitioning) && "opacity-50"
          )}
          style={[styles.button, containerStyle]}
        >
          <Animated.View
            pointerEvents="none"
            style={[StyleSheet.absoluteFillObject, idleGradientStyle]}
          >
            <Gradient
              theme={colorScheme}
              variant="primary"
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>

          <Animated.View
            pointerEvents="none"
            style={[
              StyleSheet.absoluteFillObject,
              { backgroundColor: recordingColor },
              recordingFillStyle,
            ]}
          />

          <Animated.View
            pointerEvents="none"
            style={[StyleSheet.absoluteFillObject, generateLayerStyle]}
          >
            <Gradient
              theme={colorScheme}
              variant="primary"
              style={StyleSheet.absoluteFillObject}
            />
          </Animated.View>

          <Animated.View style={[styles.content, recordContentStyle]}>
            <Icon
              name={isRecording ? "square" : "mic"}
              color="background"
              size={34}
            />
          </Animated.View>

          <Animated.View
            style={[
              styles.content,
              styles.generateContent,
              generateContentStyle,
            ]}
          >
            <Icon name="sparkles" color="background" size={14} />
            <Typography className="text-sm font-bold text-background">
              Generate Note
            </Typography>
          </Animated.View>
        </Animated.View>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: RECORD_SIZE * 1.25,
    minWidth: GENERATE_WIDTH,
    marginTop: -4,
  },
  pulse: {
    position: "absolute",
    width: RECORD_SIZE,
    height: RECORD_SIZE,
    borderRadius: RECORD_SIZE / 2,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  generateContent: {
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 12,
  },
});
