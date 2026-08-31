import { Alert, Linking, Platform } from "react-native";
import Constants from "expo-constants";
import * as MailComposer from "expo-mail-composer";
import { File, Paths } from "expo-file-system";
import {
  settingsFeedbackMailUnavailableAlertMessage,
  settingsFeedbackMailUnavailableAlertTitle,
} from "../labels/settingsFeedbackLabels";

const getFeedbackEmail = (): string => {
  const email = process.env.EXPO_PUBLIC_FEEDBACK_EMAIL;
  if (!email) {
    throw new Error("EXPO_PUBLIC_FEEDBACK_EMAIL is not set");
  }
  return email;
};

const getAppVersion = (): string => {
  const extra = Constants.expoConfig?.extra as { version?: string } | undefined;
  return extra?.version ?? Constants.expoConfig?.version ?? "unknown";
};

type AndroidConstants = {
  Brand?: string;
  Manufacturer?: string;
  Model?: string;
  Release?: string;
};

const androidConstants = (): AndroidConstants =>
  Platform.OS === "android" ? (Platform.constants as AndroidConstants) : {};

const getManufacturer = (): string => {
  if (Platform.OS === "ios") return "Apple";
  const { Manufacturer, Brand } = androidConstants();
  return Manufacturer ?? Brand ?? "unknown";
};

const getDevice = (): string => {
  if (Platform.OS === "ios") {
    return Constants.platform?.ios?.model ?? Constants.deviceName ?? "unknown";
  }
  const { Model } = androidConstants();
  return Model ?? Constants.deviceName ?? "unknown";
};

const getOsAndVersion = (): string => {
  if (Platform.OS === "ios") {
    const version =
      Constants.platform?.ios?.systemVersion ?? String(Platform.Version);
    return `iOS ${version}`;
  }
  if (Platform.OS === "android") {
    const { Release } = androidConstants();
    return `Android ${Release ?? String(Platform.Version)}`;
  }
  return `${Platform.OS} ${String(Platform.Version)}`;
};

const buildDiagnosticsText = (): string =>
  [
    `MindChart Diagnostics:`,
    `Manufacture: ${getManufacturer()}`,
    `Device: ${getDevice()}`,
    `OS: ${getOsAndVersion()}`,
    `App Version: ${getAppVersion()}`,
  ].join("\n");

const writeDiagnosticsFile = (): string => {
  const file = new File(Paths.cache, "mindchart-diagnostics.txt");
  if (file.exists) {
    file.write(buildDiagnosticsText());
  } else {
    file.create();
    file.write(buildDiagnosticsText());
  }
  return file.uri;
};

const openMailtoFallback = async (subject: string): Promise<void> => {
  const url = `mailto:${getFeedbackEmail()}?subject=${encodeURIComponent(subject)}`;
  const canOpen = await Linking.canOpenURL(url);
  if (!canOpen) {
    throw new Error("mailto unavailable");
  }
  await Linking.openURL(url);
};

export const openFeedbackMail = async (subject: string): Promise<void> => {
  try {
    const available = await MailComposer.isAvailableAsync();
    if (available) {
      await MailComposer.composeAsync({
        recipients: [getFeedbackEmail()],
        subject,
        attachments: [writeDiagnosticsFile()],
      });
      return;
    }
    await openMailtoFallback(subject);
  } catch (error) {
    console.error(error);
    Alert.alert(
      settingsFeedbackMailUnavailableAlertTitle(),
      settingsFeedbackMailUnavailableAlertMessage()
    );
  }
};
