import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { Typography } from "@/components/ui/typography";

type TimerProps = {
  isRecording: boolean;
  className?: string;
  positionSeconds?: number;
  variant?: "h1" | "h4" | "small";
};

export const Timer: React.FC<TimerProps> = ({
  isRecording,
  className,
  positionSeconds,
  variant = "h1",
}) => {
  const [seconds, setSeconds] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Use internal timer when recording, external timer when playing
  const useInternalTimer = isRecording;

  // INTERNAL TIMER (recording)
  useEffect(() => {
    if (useInternalTimer && isRecording) {
      startTimeRef.current = Date.now();
      setSeconds(0);

      intervalRef.current = setInterval(() => {
        if (startTimeRef.current) {
          const elapsedSec = Math.floor(
            (Date.now() - startTimeRef.current) / 1000
          );
          setSeconds(elapsedSec);
        }
      }, 250);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRecording, useInternalTimer]);

  // EXTERNAL TIMER (playback)
  useEffect(() => {
    if (!useInternalTimer && positionSeconds != null) {
      setSeconds(Math.floor(positionSeconds));
    }
  }, [positionSeconds, useInternalTimer]);

  const formatMSS = (sec: number) => {
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    const seconds = sec % 60;

    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  return (
    <Typography
      variant={variant}
      className={cn("text-popover-foreground tabular-nums", className)}
    >
      {formatMSS(seconds)}
    </Typography>
  );
};
