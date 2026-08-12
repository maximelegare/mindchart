// MindChart – Copyright (C) 2007-2026 Maxime Legare
// Licensed under GNU AGPL v3 + Commercial Use Restrictions
// You may not use the name "MindChart" for derivative or competing products.
// See LICENSE.md for full license and terms.

import "./global.css";
import "@/lib/hideScrollIndicators";

import * as React from "react";
import { useEffect, useState } from "react";
import { View } from "react-native";
import { hsl } from "@/utils/hsl";

import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { ThemeProvider, type Theme } from "@react-navigation/native";
import { SplashScreen, Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useFonts } from "expo-font";
import { PaperProvider } from "react-native-paper";

import { PortalHost } from "@/components/primitives/portal";
import { ModalProvider } from "@/components/ui/modal/modal";
import { FolderFormSheetProvider } from "@/features/contentList/features/folderContents/components/folderFormSheet";
import { WorkspaceEditSheetProvider } from "@/features/workspaces/components/manageWorkspaces/workspaceEditSheet";

import { WhisperProvider } from "@/features/whisper/context/whispterContext";
import { LlamaProvider } from "@/features/llama/context/llamaContext";

import { DARK_THEME, LIGHT_THEME } from "@repo/theme/global";
import { useColorScheme } from "@/lib/useColorScheme";
import { themeVars } from "@/lib/themeVars";
import {
  getThemePreference,
  resolveThemePreference,
  setThemePreference,
} from "@/lib/themePreference";
import { setAndroidNavigationBar } from "@/lib/android-navigation-bar";
import { useFrameworkReady } from "@/hooks/useFrameworkReady";
import { cn } from "@/lib/cn";
import {
  runMigrations,
  setActiveWorkspace,
  setWorkspaceEncryptionKey,
  validateIfDBExists,
} from "@repo/sqlite";
import { useWorkspacesStore } from "@/features/workspaces/context/workspacesContext";
import {
  getKeyForWorkspace,
  hasKeyForWorkspace,
} from "@/features/workspaces/services/workspaceKeyService";
import { migrateLegacyDatabase } from "@/features/workspaces/utils/migrateLegacyDatabase";
import type { Workspace } from "@/features/workspaces/context/workspacesContext";
import { KeyboardProvider } from "react-native-keyboard-controller";

import { Buffer } from "buffer";
import { AutoConnectService } from "@/features/settings/features/ai/autoConnect/services/autoConnectService";
global.Buffer = Buffer;

export { ErrorBoundary } from "expo-router";

// Prevent splash auto hide until we say so
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

async function resolveWorkspaceWithKey(
  workspaces: Workspace[],
  activeWorkspaceId: string | null
): Promise<Workspace | null> {
  const preferred =
    workspaces.find((w) => w.id === activeWorkspaceId) ?? workspaces[0];
  if (preferred && (await hasKeyForWorkspace(preferred.id))) {
    return preferred;
  }
  for (const workspace of workspaces) {
    if (await hasKeyForWorkspace(workspace.id)) {
      return workspace;
    }
  }
  return null;
}

/** Open the active workspace DB (key + migrations) and return whether app_data exists. */
async function openActiveWorkspaceAndValidate(): Promise<boolean> {
  const { workspaces, activeWorkspaceId } = useWorkspacesStore.getState();
  const active = await resolveWorkspaceWithKey(workspaces, activeWorkspaceId);

  if (!active) {
    return false;
  }

  if (!activeWorkspaceId || activeWorkspaceId !== active.id) {
    useWorkspacesStore.getState().setActiveWorkspaceId(active.id);
  }

  const encryptionKey = await getKeyForWorkspace(active.id);
  if (!encryptionKey) {
    return false;
  }

  await setActiveWorkspace(active.dbFileName);
  setWorkspaceEncryptionKey(encryptionKey);
  await runMigrations();

  return validateIfDBExists();
}

export default function RootLayout() {
  const { colorScheme } = useColorScheme();

  const router = useRouter();
  const segments = useSegments();

  const [isDbChecked, setIsDbChecked] = useState(false);
  const [dbExists, setDbExists] = useState<boolean | null>(null);

  useFrameworkReady();

  const [loadedFonts, fontError] = useFonts({
    QuicksandRegular: require("@/assets/fonts/Quicksand-Regular.ttf"),
    QuicksandBold: require("../assets/fonts/Quicksand-Bold.ttf"),
  });

  /**
   * 1. Initialize Theme & DB Status
   */
  useEffect(() => {
    async function initializeApp() {
      // Re-apply stored preference so NativeWind / Appearance match MMKV.
      setThemePreference(getThemePreference());
      setAndroidNavigationBar(resolveThemePreference());

      // Workspace + DB Logic
      try {
        await migrateLegacyDatabase();
        const exists = await openActiveWorkspaceAndValidate();
        setDbExists(exists);
      } catch (e) {
        console.warn(e);
        setDbExists(false);
      } finally {
        setIsDbChecked(true);
      }
    }

    initializeApp();
  }, []);

  /**
   * 2. Re-check database when navigating to (tabs) in case migration just completed
   */
  useEffect(() => {
    if (!isDbChecked || !loadedFonts) return;

    const isNavigatingToTabs = segments[0] === "(tabs)";

    // If we're navigating to (tabs) and db was previously false, re-open workspace + check
    if (isNavigatingToTabs && dbExists === false) {
      openActiveWorkspaceAndValidate()
        .then((exists) => {
          if (exists) {
            setDbExists(true);
          }
        })
        .catch(() => {
          // Keep dbExists as false if check fails
        });
    }
  }, [segments, isDbChecked, loadedFonts, dbExists]);

  /**
   * 3. Navigation Guard & Splash Hiding
   */
  useEffect(() => {
    if (!isDbChecked || !loadedFonts) return;

    const isOnTabs = segments[0] === "(tabs)";

    // Don't redirect if we're already on (tabs) - allow re-check to happen
    // Only redirect if we're not on (tabs) and database doesn't exist
    if (!dbExists && !isOnTabs) {
      // Redirect to onboarding
      router.replace("/newDatabase");
    }

    // Hide splash screen once we know where we are going
    SplashScreen.hideAsync();
  }, [isDbChecked, loadedFonts, dbExists, segments, router]);

  /**
   * 4. Android nav bar follows the resolved scheme (preference is owned elsewhere).
   */
  useEffect(() => {
    setAndroidNavigationBar(colorScheme);
  }, [colorScheme]);

  // Handle Font Errors
  if (fontError) throw fontError;

  // While initializing, return null (Splash screen stays visible)
  if (!loadedFonts || !isDbChecked) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider
        value={
          colorScheme === "dark"
            ? (DARK_THEME as Theme)
            : (LIGHT_THEME as Theme)
        }
      >
        <KeyboardProvider>
          <GestureHandlerRootView
            style={{
              flex: 1,
              backgroundColor: hsl("background", colorScheme),
            }}
          >
            <View
              style={[
                {
                  flex: 1,
                  backgroundColor: hsl("background", colorScheme),
                },
                themeVars(colorScheme === "dark" ? "dark" : "light"),
              ]}
              className={cn("flex-1", colorScheme === "dark" ? "dark" : "")}
            >
              <BottomSheetModalProvider>
                <PaperProvider>
                  <ModalProvider>
                    <FolderFormSheetProvider>
                      <WorkspaceEditSheetProvider>
                        <LlamaProvider>
                          <StatusBar
                            style={colorScheme === "dark" ? "light" : "dark"}
                          />

                          <WhisperProvider>
                            <AutoConnectService>
                              <Stack
                                screenOptions={{
                                  headerShown: false,
                                  contentStyle: {
                                    backgroundColor: hsl(
                                      "background",
                                      colorScheme
                                    ),
                                  },
                                }}
                              >
                                <Stack.Screen name="(tabs)" />
                                <Stack.Screen name="(stack)" />
                              </Stack>
                            </AutoConnectService>
                          </WhisperProvider>
                        </LlamaProvider>
                      </WorkspaceEditSheetProvider>
                    </FolderFormSheetProvider>
                  </ModalProvider>
                  <PortalHost />
                </PaperProvider>
              </BottomSheetModalProvider>
            </View>
          </GestureHandlerRootView>
        </KeyboardProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
