import { LoadingState } from "@/components/ui/modal/custom/loadingState/loadingState";
import { useModal } from "@/components/ui/modal/modal";
import { useAiAutoConnect } from "@/features/settings/features/ai/autoConnect/hooks/useAutoConnect";
import { useRouter } from "expo-router";
import { useEffect } from "react";

export const AutoConnectService = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { isInitializing, setupRequired, isReady } = useAiAutoConnect();
  const { openModal, closeModal } = useModal();
  const router = useRouter();

  useEffect(() => {
    if (!isReady) return; // 🚨 prevents flicker entirely

    let timer: ReturnType<typeof setTimeout> | undefined;

    if (isInitializing) {
      timer = setTimeout(() => {
        openModal({
          dismissOnBackgroundPress: false,
          customContent: () => (
            <LoadingState title="Initializing AI Models" size="large" />
          ),
        });
      }, 300); // slight delay avoids micro flicker
    } else if (setupRequired) {
      timer = setTimeout(() => {
        openModal({
          modalName: "AI_SETUP_REQUIRED",
          confirmText: "Go to Settings",
          onConfirm: () => {
            router.push("/settings/ai");
            closeModal();
          },
        });
      }, 300);
    } else {
      closeModal();
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [isInitializing, setupRequired, isReady, openModal, closeModal]);

  return <>{children}</>;
};
