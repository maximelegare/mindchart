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
import {
  View,
  StyleSheet,
  Animated,
  Dimensions,
  Keyboard,
  Modal as RNModal,
} from "react-native";
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
  onConfirm?: () => void | Promise<void>;
  dismissOnBackgroundPress?: boolean;
  customContent?: (() => ReactNode | ReactElement) | null;
  /**
   * When true, render above open bottom sheets via a native modal layer.
   * When false/omitted, use the paper Portal (can sit under bottom sheets).
   */
  aboveBottomSheet?: boolean;
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
  const [contentKey, setContentKey] = useState(0);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  const openModal = useCallback((options: ModalOptions) => {
    setContentKey((k) => k + 1);
    setModalOptions(options);
    setIsVisible(true);
  }, []);

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

  const setModalContent = useCallback((newOptions: Partial<ModalOptions>) => {
    setContentKey((k) => k + 1);
    setModalOptions((prev) => {
      const next = { ...prev, ...newOptions };
      if ("customContent" in newOptions && newOptions.customContent === null) {
        delete next.customContent;
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (isVisible) {
      slideAnim.setValue(SCREEN_HEIGHT / 2 + 200);
      backdropOpacity.setValue(0);

      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
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
    aboveBottomSheet = false,
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

  const handleBackgroundDismiss = () => {
    if (!dismissOnBackgroundPress) return;
    onCancel?.();
    closeModal();
  };

  const card = (
    <Animated.View
      style={{
        transform: [{ translateY: slideAnim }],
        maxHeight: SCREEN_HEIGHT - 80,
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
            <View className="absolute -top-3 -right-3 -left-3 bg-border h-12" />
          </View>
        )}

        {customContent ? (
          <View key={contentKey}>{customContent()}</View>
        ) : (
          <View>
            <Typography variant="p">
              {description ||
                (modalName && MODALS_CONTENT[modalName]?.description)}
            </Typography>
          </View>
        )}

        {!customContent && (
          <View className="mt-4 flex-row justify-end gap-2">
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
              <Button
                variant={confirmButton.variant}
                onPress={() => void onConfirm()}
              >
                <Typography>{confirmButton.text}</Typography>
              </Button>
            )}
          </View>
        )}
      </View>
    </Animated.View>
  );

  const backdrop = (
    <Animated.View
      pointerEvents={isVisible ? "auto" : "none"}
      style={[
        StyleSheet.absoluteFill,
        { backgroundColor: "rgba(0,0,0,0.6)", opacity: backdropOpacity },
      ]}
      onStartShouldSetResponder={() => dismissOnBackgroundPress}
      onResponderRelease={handleBackgroundDismiss}
    />
  );

  return (
    <ModalContext.Provider value={{ openModal, closeModal, setModalContent }}>
      {children}
      {aboveBottomSheet ? (
        <RNModal
          visible={isVisible}
          transparent
          animationType="none"
          statusBarTranslucent
          onRequestClose={
            dismissOnBackgroundPress ? onCancel || closeModal : undefined
          }
        >
          <View style={StyleSheet.absoluteFill}>
            {backdrop}
            <View
              pointerEvents="box-none"
              style={[
                StyleSheet.absoluteFill,
                {
                  justifyContent: "center",
                  paddingHorizontal: 16,
                  paddingBottom: keyboardHeight,
                },
              ]}
            >
              {card}
            </View>
          </View>
        </RNModal>
      ) : (
        <Portal>
          {backdrop}
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
            {card}
          </Modal>
        </Portal>
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (context) return context;
  if (modalFunctionsRef.current) return modalFunctionsRef.current;
  throw new Error("useModal must be used inside ModalProvider");
};
