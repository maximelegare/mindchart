// MindChart – Copyright (C) 2007-2026 Maxime Legare
// Licensed under GNU AGPL v3 + Commercial Use Restrictions
// You may not use the name "MindChart" for derivative or competing products.
// See LICENSE.md for full license and terms.

import type { ConfigContext, ExpoConfig } from "@expo/config";
import pkg from "./package.json";

const version = pkg.version;

const isDev = process.env.NODE_ENV !== "production";

function versionCode(v: string) {
  const [major, minor, patch] = v.split(".").map(Number);
  return major * 10000 + minor * 100 + patch;
}

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "MindChart",
  slug: "mindchart",
  newArchEnabled: true,
  version,
  orientation: "portrait",
  icon: "./assets/images/icon.png",
  scheme: "mindchart",
  userInterfaceStyle: "light",
  runtimeVersion: {
    policy: "appVersion",
  },
  updates: {
    url: "https://u.expo.dev/c093ea99-2e9d-4ba7-b127-097a209f3928",
  },
  splash: {
    image: "./assets/images/splash.png",
    resizeMode: "contain",
    backgroundColor: "#17302b",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    newArchEnabled: true,
    supportsTablet: true,
    bundleIdentifier: isDev ? "com.mindchart.dev.app" : "com.mindchart.app",
    buildNumber: version,
    infoPlist: {
      NSContactsUsageDescription:
        "MindChart uses your contacts to help you tag people in notes.",
    },
  },
  android: {
    newArchEnabled: true,
    adaptiveIcon: {
      foregroundImage: isDev
        ? "./assets/images/adaptive-icon_dev.png"
        : "./assets/images/adaptive-icon.png",
      backgroundColor: "#17302b",
    },
    versionCode: versionCode(version),
    package: isDev ? "com.mindchart.dev.app" : "com.mindchart.app",
    permissions: ["RECORD_AUDIO", "READ_CONTACTS"],
    softwareKeyboardLayoutMode: "resize",
  },
  web: {
    bundler: "metro",
    output: "static",
    favicon: "./assets/images/favicon.png",
  },
  plugins: [
    "expo-router",
    "expo-font",
    "expo-web-browser",
    "expo-updates",
    [
      "expo-contacts",
      {
        contactsPermission:
          "Allow MindChart to access your contacts to tag people in notes.",
      },
    ],
    [
      "expo-local-authentication",
      {
        faceIDPermission:
          "Allow MindChart to use Face ID to enable and reveal your recovery passphrase.",
      },
    ],
    [
      "expo-secure-store",
      {
        faceIDPermission:
          "Allow MindChart to use Face ID to enable and reveal your recovery passphrase.",
      },
    ],
    [
      "llama.rn",
      {
        enableEntitlements: true,
        entitlementsProfile: "production",
        forceCxx20: true,
        enableOpenCLAndHexagon: true,
      },
    ],
    [
      "expo-splash-screen",
      {
        backgroundColor: "#17302b",
        image: "./assets/images/splash.png",
        resizeMode: "contain",
        imageWidth: 250,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    baseUrl: "/mindchart",
  },
  extra: {
    version,
    gitCommit: process.env.GITHUB_SHA ?? null,
    buildTime: new Date().toISOString(),
    eas: {
      projectId: "c093ea99-2e9d-4ba7-b127-097a209f3928",
    },
  },
  owner: "maximelegare",
});
