import React, { useEffect, useState, useRef, useMemo } from "react";
import { View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from "react-native-reanimated";
import { SIZE } from "./constants";

type LineData = {
  id: number;
  metering: number;
  timestamp: number;
};

export const VerticalLines = ({
  metering,
  isRecording,
}: {
  metering: number;
  isRecording: boolean;
}) => {
  const [lines, setLines] = useState<LineData[]>([]);
  const meteringBufferRef = useRef<number[]>([]);
  const lineIdCounter = useRef(0);
  const MAX_LINES = 100; // Reduced for better performance

  useEffect(() => {
    if (!isRecording) {
      // Reset when recording stops
      setLines([]);
      meteringBufferRef.current = [];
      return;
    }

    // Collect every metering value
    meteringBufferRef.current.push(metering);

    // When we have 3 values, calculate average and create a line (more frequent = closer together)
    if (meteringBufferRef.current.length >= 3) {
      // Calculate average efficiently
      const sum = meteringBufferRef.current.reduce((acc, val) => acc + val, 0);
      const averageMetering = sum / 3;

      // Create a line with the averaged value
      setLines((prev) => {
        const newLine: LineData = {
          id: lineIdCounter.current++,
          metering: averageMetering,
          timestamp: Date.now(),
        };
        const updated = [...prev, newLine];
        // Limit the number of lines to prevent memory issues
        return updated.length > MAX_LINES ? updated.slice(-MAX_LINES) : updated;
      });

      // Clear the buffer to start collecting the next 3 values
      meteringBufferRef.current = [];
    }
  }, [metering, isRecording]);

  // Shared value for animation time
  const animationTime = useSharedValue(0);

  // Clean up lines that have moved off-screen - optimized
  useEffect(() => {
    if (!isRecording || lines.length === 0) return;

    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      const speed = 2.5; // Faster speed
      const offScreenThreshold = -10; // Remove lines that are 10% off-screen

      setLines((prevLines) => {
        // Only filter if we have many lines to avoid unnecessary work
        if (prevLines.length < 50) return prevLines;

        return prevLines.filter((line) => {
          const elapsedSeconds = (now - line.timestamp) / 1000;
          const leftPosition = 50 - elapsedSeconds * speed;
          return leftPosition > offScreenThreshold;
        });
      });
    }, 2000); // Clean up every 2 seconds for better performance

    return () => clearInterval(cleanupInterval);
  }, [isRecording, lines.length]);

  // Continuously update animation time
  useEffect(() => {
    if (!isRecording) {
      animationTime.value = 0;
      return;
    }

    const interval = setInterval(() => {
      animationTime.value = Date.now();
    }, 16); // ~60fps

    return () => clearInterval(interval);
  }, [isRecording, animationTime]);

  // Memoize lines to prevent unnecessary re-renders
  const memoizedLines = useMemo(() => lines, [lines]);

  return (
    <View className="absolute w-full h-full">
      {memoizedLines.map((line) => (
        <AnimatedLine
          key={line.id}
          metering={line.metering}
          creationTime={line.timestamp}
          animationTime={animationTime}
        />
      ))}
    </View>
  );
};

// Constants outside component for better performance
const MIN_METERING = -160;
const MAX_METERING = 0;
const CENTER_POSITION = 50;
const SPEED = 2.5; // Faster movement
const LINE_WIDTH = 6; // Thicker lines

const AnimatedLine = React.memo(
  ({
    metering,
    creationTime,
    animationTime,
  }: {
    metering: number;
    creationTime: number;
    animationTime: SharedValue<number>;
  }) => {
    // Pre-calculate height values - memoized
    const { lineHeight, topOffset } = useMemo(() => {
      const normalizedMetering = Math.max(
        0,
        Math.min(1, (metering - MIN_METERING) / (MAX_METERING - MIN_METERING))
      );
      const exponentialValue = Math.pow(normalizedMetering, 5);
      const heightPercentage = 2 + exponentialValue * 98;
      const height = (SIZE * heightPercentage) / 100;
      return {
        lineHeight: height,
        topOffset: (SIZE - height) / 2,
      };
    }, [metering]);

    const creationTimeValue = useSharedValue(creationTime);

    const animatedStyle = useAnimatedStyle(() => {
      const currentTime = animationTime.value || Date.now();
      const elapsedSeconds = (currentTime - creationTimeValue.value) / 1000;
      const leftPosition = CENTER_POSITION - elapsedSeconds * SPEED;

      return {
        left: `${Math.max(-10, leftPosition)}%`,
        height: lineHeight,
        top: topOffset,
      };
    }, [lineHeight, topOffset]);

    return (
      <Animated.View
        className="absolute bg-primary rounded-full"
        style={[
          animatedStyle,
          {
            width: LINE_WIDTH,
            marginLeft: -LINE_WIDTH / 2,
          },
        ]}
      />
    );
  }
);

AnimatedLine.displayName = "AnimatedLine";
