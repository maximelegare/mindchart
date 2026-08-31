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

const getOsVersion = (): string => {
  if (Platform.OS === "ios") {
    return `iOS ${String(Platform.Version)}`;
  }
  if (Platform.OS === "android") {
    const release =
      "Release" in Platform.constants && Platform.constants.Release
        ? String(Platform.constants.Release)
        : String(Platform.Version);
    return `Android ${release}`;
  }
  return `${Platform.OS} ${String(Platform.Version)}`;
};

const buildDiagnosticsText = (): string =>
  [
    "MindChart diagnostics",
    `App version: ${getAppVersion()}`,
    `OS: ${getOsVersion()}`,
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
