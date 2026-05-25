import { useEffect } from "react";
import { useMigrationHelper } from "@repo/sqlite";

type Props = {
  onReady: () => void;
  onError?: (error: unknown) => void;
};

/**
 * Runs `useMigrationHelper` on whichever DB the sqlite singleton currently
 * points at. Remount via a `key` (e.g. `dbEpoch`) to re-run migrations after
 * a workspace switch / import. Renders nothing.
 */
export const WorkspaceMigrationGate = ({ onReady, onError }: Props) => {
  const { success, error } = useMigrationHelper();

  useEffect(() => {
    if (success) onReady();
  }, [success, onReady]);

  useEffect(() => {
    if (error) {
      console.warn("Workspace migration error", error);
      onError?.(error);
    }
  }, [error, onError]);

  return null;
};
