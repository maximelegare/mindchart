import { LoadingState } from "@/components/ui/modal/custom/loadingState/loadingState";
import { useModal } from "@/components/ui/modal/modal";
import { useAiAutoConnect } from "@/features/settings/features/ai/autoConnect/hooks/useAutoConnect";
import { useEffect } from "react";

export const AutoConnectService = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isInitializing } = useAiAutoConnect();
  const { openModal, closeModal } = useModal();

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;

    // Add a delay to ensure the UI Thread and Portal are stable to make sure the modal appears
    if (isInitializing) {
      timer = setTimeout(() => {
        openModal({
          dismissOnBackgroundPress: false,
          customContent: () => (
            <LoadingState title="Initializing AI Models" size="large" />
          ),
        });
      }, 500);
    } else {
      closeModal();
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isInitializing, openModal, closeModal]);

  return <>{children}</>;
};
