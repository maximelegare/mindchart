import React, { createContext, useContext, useMemo, useRef } from "react";
import type { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";

type LockScreenSettingsUiContextValue = {
  openPinSheet: () => void;
  closePinSheet: () => void;
  pinSheetRef: React.RefObject<BottomSheetModalMethods | null>;
};

const LockScreenSettingsUiContext =
  createContext<LockScreenSettingsUiContextValue | null>(null);

export function LockScreenSettingsUiProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const pinSheetRef = useRef<BottomSheetModalMethods | null>(null);

  const value = useMemo(
    () => ({
      pinSheetRef,
      openPinSheet: () => pinSheetRef.current?.present(),
      closePinSheet: () => pinSheetRef.current?.dismiss(),
    }),
    []
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
