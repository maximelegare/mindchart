import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { AppState, type AppStateStatus } from "react-native";
import { useSecuritySettingsPreferences } from "@/features/settings/context/security";
import { hasAppPin } from "../services/passcodeService";

type AppLockContextValue = {
  isLocked: boolean;
  isReady: boolean;
  hasCustomPin: boolean;
  unlock: () => void;
  lock: () => void;
  refreshCustomPinState: () => Promise<void>;
};

const AppLockContext = createContext<AppLockContextValue | null>(null);

export function AppLockProvider({ children }: { children: React.ReactNode }) {
  const lockScreenMode = useSecuritySettingsPreferences(
    (s) => s.lockScreenMode
  );
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [hasCustomPin, setHasCustomPin] = useState(false);
  const [isReady, setIsReady] = useState(false);

  const lockEnabled =
    lockScreenMode === "system" ||
    (lockScreenMode === "customPin" && hasCustomPin);

  const refreshCustomPinState = useCallback(async () => {
    setHasCustomPin(await hasAppPin());
  }, []);

  useEffect(() => {
    let mounted = true;

    refreshCustomPinState().finally(() => {
      if (mounted) {
        setIsReady(true);
        setIsUnlocked(!lockEnabled);
      }
    });

    return () => {
      mounted = false;
    };
  }, [lockEnabled, refreshCustomPinState]);

  useEffect(() => {
    if (!isReady) return;
    setIsUnlocked(!lockEnabled);
  }, [isReady, lockEnabled]);

  const lock = useCallback(() => {
    if (!lockEnabled) return;
    setIsUnlocked(false);
  }, [lockEnabled]);

  const unlock = useCallback(() => {
    setIsUnlocked(true);
  }, []);

  useEffect(() => {
    if (!lockEnabled) return;

    const onAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === "background" || nextState === "inactive") {
        lock();
      }
    };

    const subscription = AppState.addEventListener("change", onAppStateChange);
    return () => subscription.remove();
  }, [lock, lockEnabled]);

  const value = useMemo(
    () => ({
      isLocked: lockEnabled && !isUnlocked,
      isReady,
      hasCustomPin,
      unlock,
      lock,
      refreshCustomPinState,
    }),
    [
      hasCustomPin,
      isReady,
      isUnlocked,
      lock,
      lockEnabled,
      refreshCustomPinState,
      unlock,
    ]
  );

  return (
    <AppLockContext.Provider value={value}>{children}</AppLockContext.Provider>
  );
}

export function useAppLock() {
  const context = useContext(AppLockContext);
  if (!context) {
    throw new Error("useAppLock must be used within AppLockProvider");
  }
  return context;
}
