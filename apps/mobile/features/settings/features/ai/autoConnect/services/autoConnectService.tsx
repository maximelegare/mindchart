import { useModal } from "@/components/ui/modal/modal";
import { LoadingState } from "@/components/ui/modal/custom/loadingState/loadingState";
import { settingsAiConnectingTitle } from "@/features/settings/features/ai/labels/settingsAiLabels";
import { useAiAutoConnect } from "@/features/settings/features/ai/autoConnect/hooks/useAutoConnect";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";

export const AutoConnectService = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { setupRequired, isReady, isInitializing } = useAiAutoConnect();
  const { openModal, closeModal } = useModal();
  const router = useRouter();

  const hasShownSetupModal = useRef(false);
  const connectingModalOpen = useRef(false);

  useEffect(() => {
    if (isInitializing) {
      connectingModalOpen.current = true;
      openModal({
        dismissOnBackgroundPress: false,
        customContent: () => (
          <LoadingState title={settingsAiConnectingTitle()} size="large" />
        ),
      });
      return;
    }

    if (connectingModalOpen.current) {
      connectingModalOpen.current = false;
      closeModal();
    }
  }, [isInitializing, openModal, closeModal]);

  useEffect(() => {
    if (!isReady || isInitializing) return;

    let timer: ReturnType<typeof setTimeout> | undefined;

    if (setupRequired) {
      // Silent connect otherwise — only surface the embeddings setup modal
      if (!hasShownSetupModal.current) {
        timer = setTimeout(() => {
          openModal({
            modalName: "AI_SETUP_REQUIRED",
            onConfirm: () => {
              router.push("/settings");
              closeModal();
            },
          });
          hasShownSetupModal.current = true;
        }, 300);
      }
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [setupRequired, isReady, isInitializing, openModal, closeModal, router]);

  return <>{children}</>;
};
