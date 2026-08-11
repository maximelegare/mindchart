import { useModal } from "@/components/ui/modal/modal";
import { useAiAutoConnect } from "@/features/settings/features/ai/autoConnect/hooks/useAutoConnect";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";

export const AutoConnectService = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { setupRequired, isReady } = useAiAutoConnect();
  const { openModal, closeModal } = useModal();
  const router = useRouter();

  const hasShownSetupModal = useRef(false);

  useEffect(() => {
    if (!isReady) return;

    let timer: ReturnType<typeof setTimeout> | undefined;

    if (setupRequired) {
      // Silent connect otherwise — only surface the embeddings setup modal
      if (!hasShownSetupModal.current) {
        timer = setTimeout(() => {
          openModal({
            modalName: "AI_SETUP_REQUIRED",
            confirmButton: { text: "Go to Settings" },
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
  }, [setupRequired, isReady, openModal, closeModal, router]);

  return <>{children}</>;
};
