import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import { hasAppPin } from "../services/passcodeService";

export type PinSheetSession = {
  hasPin: boolean;
  sessionId: number;
};

type LockScreenSettingsUiContextValue = {
  openPinSheet: () => Promise<void>;
  closePinSheet: () => void;
  clearPinSheetSession: () => void;
  pinSheetRef: React.RefObject<BottomSheetModalMethods | null>;
  pinSheetSession: PinSheetSession | null;
};

const LockScreenSettingsUiContext =
  createContext<LockScreenSettingsUiContextValue | null>(null);

export function LockScreenSettingsUiProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pinSheetRef = useRef<BottomSheetModalMethods | null>(null);
  const [pinSheetSession, setPinSheetSession] =
    useState<PinSheetSession | null>(null);

  const clearPinSheetSession = useCallback(() => {
    setPinSheetSession(null);
  }, []);

  const openPinSheet = useCallback(async () => {
    const pinExists = await hasAppPin();
    setPinSheetSession({
      hasPin: pinExists,
      sessionId: Date.now(),
    });
    requestAnimationFrame(() => {
      pinSheetRef.current?.present();
    });
  }, []);

  const closePinSheet = useCallback(() => {
    pinSheetRef.current?.dismiss();
  }, []);

  const value = useMemo(
    () => ({
      pinSheetRef,
      pinSheetSession,
      openPinSheet,
      closePinSheet,
      clearPinSheetSession,
    }),
    [clearPinSheetSession, closePinSheet, openPinSheet, pinSheetSession]
  );

  return (
    <LockScreenSettingsUiContext.Provider value={value}>
      {children}
    </LockScreenSettingsUiContext.Provider>
  );
}

export function useLockScreenSettingsUi() {
  const context = useContext(LockScreenSettingsUiContext);
  if (!context) {
    throw new Error(
      "useLockScreenSettingsUi must be used within LockScreenSettingsUiProvider"
    );
  }
  return context;
}
