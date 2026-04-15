import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  ReactElement,
  useRef,
  useCallback,
  useEffect,
} from "react";
import { View, StyleSheet, Animated, Dimensions, Keyboard } from "react-native";
import { Modal, Portal } from "react-native-paper";
import { Typography } from "../typography";
import { Button } from "../button";
import { MODALS_CONTENT, type ModalButtonConfig } from "./data/modals";
import { cn } from "@/lib/cn";

const SCREEN_HEIGHT = Dimensions.get("window").height;

type ModalOptions = {
  modalName?: keyof typeof MODALS_CONTENT;
  title?: string;
  description?: string;
  onCancel?: () => void;
  cancelButton?: Partial<ModalButtonConfig>;
  confirmButton?: Partial<ModalButtonConfig>;
  onConfirm?: () => void;
  dismissOnBackgroundPress?: boolean;
  customContent?: () => ReactNode | ReactElement;
};

type ModalContextType = {
  openModal: (options: ModalOptions) => void;
  closeModal: () => void;
  setModalContent: (options: Partial<ModalOptions>) => void;
};

const ModalContext = createContext<ModalContextType | null>(null);
const modalFunctionsRef = React.createRef<ModalContextType>();

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [modalOptions, setModalOptions] = useState<ModalOptions>({});
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Open modal
  const openModal = useCallback((options: ModalOptions) => {
    setModalOptions(options);
    setIsVisible(true);
  }, []);

  // Close modal
  const closeModal = useCallback(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setIsVisible(false));
  }, [slideAnim, backdropOpacity]);

  // Update modal content
  const setModalContent = useCallback((newOptions: Partial<ModalOptions>) => {
    setModalOptions((prev) => ({ ...prev, ...newOptions }));
  }, []);

  // Animate when modal opens
  useEffect(() => {
    if (isVisible) {
      slideAnim.setValue(SCREEN_HEIGHT / 2 + 200); // start below center
      backdropOpacity.setValue(0);

      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0, // center
          velocity: 15,
          bounciness: 8,
          speed: 10,
          useNativeDriver: true,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [isVisible, slideAnim, backdropOpacity]);

  // Keyboard handling
  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) =>
      setKeyboardHeight(e.endCoordinates.height)
    );
    const hideSub = Keyboard.addListener("keyboardDidHide", () =>
      setKeyboardHeight(0)
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Update module-level ref
  useEffect(() => {
    modalFunctionsRef.current = { openModal, closeModal, setModalContent };
    return () => {
      modalFunctionsRef.current = null;
    };
  }, [openModal, closeModal, setModalContent]);

  const {
    title,
    modalName,
    description,
    customContent,
    onCancel,
    onConfirm,
    confirmButton: confirmButtonOption,
    cancelButton: cancelButtonOption,
    dismissOnBackgroundPress = true,
  } = modalOptions;

  const modalPreset = modalName ? MODALS_CONTENT[modalName] : undefined;
  const confirmButton: ModalButtonConfig = {
    text:
      confirmButtonOption?.text ?? modalPreset?.confirmButton.text ?? "Confirm",
    variant:
      confirmButtonOption?.variant ??
      modalPreset?.confirmButton.variant ??
      "default",
  };
  const cancelButton: ModalButtonConfig = {
    text:
      cancelButtonOption?.text ?? modalPreset?.cancelButton.text ?? "Cancel",
    variant:
      cancelButtonOption?.variant ??
      modalPreset?.cancelButton.variant ??
      "destructive",
  };

  const hasTitle = title || (modalName && MODALS_CONTENT[modalName]?.title);

  return (
    // <LlamaProvider>
    <ModalContext.Provider value={{ openModal, closeModal, setModalContent }}>
      {children}
      <Portal>
        {/* BACKDROP */}
        <Animated.View
          pointerEvents={isVisible ? "auto" : "none"}
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: "rgba(0,0,0,0.6)", opacity: backdropOpacity },
          ]}
          onStartShouldSetResponder={() => dismissOnBackgroundPress}
          onResponderRelease={() => {
            if (dismissOnBackgroundPress) {
              onCancel?.();
              closeModal();
            }
          }}
        />
        {/* MODAL */}
        <Modal
          visible={isVisible}
          onDismiss={
            dismissOnBackgroundPress ? onCancel || closeModal : undefined
          }
          style={{ backgroundColor: "transparent", flex: 1 }}
          contentContainerStyle={{
            flex: 1,
            justifyContent: "center",
            paddingHorizontal: 16,
            paddingBottom: keyboardHeight,
          }}
        >
          <Animated.View
            style={{
              transform: [{ translateY: slideAnim }],
              maxHeight: SCREEN_HEIGHT - 80, // prevent overflow
            }}
          >
            <View
              className={cn(
                "flex-col gap-4 bg-background p-3 rounded-lg overflow-hidden",
                customContent && "min-h-0"
              )}
            >
              {hasTitle && (
                <View className="relative">
                  <View className="mb-2">
                    <Typography className="relative z-10" variant="h3">
                      {title || (modalName && MODALS_CONTENT[modalName]?.title)}
                    </Typography>
                  </View>
                  <View className="absolute -top-3 -right-3 -left-3 bg-border h-12"></View>
                </View>
              )}

              {customContent ? (
                <View>{customContent()}</View>
              ) : (
                <View>
                  <Typography variant="p">
                    {description ||
                      (modalName && MODALS_CONTENT[modalName]?.description)}
                  </Typography>
                </View>
              )}

              {!customContent && (
                <View className="flex-row justify-end gap-2 mt-4">
                  <Button
                    variant={cancelButton.variant}
                    onPress={() => {
                      onCancel?.();
                      closeModal();
                    }}
                  >
                    <Typography>{cancelButton.text}</Typography>
                  </Button>
                  {onConfirm && (
                    <Button variant={confirmButton.variant} onPress={onConfirm}>
                      <Typography>{confirmButton.text}</Typography>
                    </Button>
                  )}
                </View>
              )}
            </View>
          </Animated.View>
        </Modal>
      </Portal>
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context) return context;
  if (modalFunctionsRef.current) return modalFunctionsRef.current;
  throw new Error("useModal must be used inside ModalProvider");
};
