// MindChart – Copyright (C) 2007-2026 Maxime Legare
// Licensed under GNU AGPL v3 + Commercial Use Restrictions
// You may not use the name "MindChart" for derivative or competing products.
// See LICENSE.md for full license and terms.

import "./global.css";

import * as React from "react";
import { useEffect, useState } from "react";
import { View } from "react-native";

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

import { WhisperProvider } from "@/features/whisper/context/whispterContext";
import { LlamaProvider } from "@/features/llama/context/llamaContext";

import { DARK_THEME, LIGHT_THEME } from "@repo/theme/global";
import { useColorScheme } from "@/lib/useColorScheme";
import { getItem, setItem } from "@/lib/storage";
import { setAndroidNavigationBar } from "@/lib/android-navigation-bar";
import { useFrameworkReady } from "@/hooks/useFrameworkReady";
import { cn } from "@/lib/cn";
import { validateIfDBExists } from "@repo/sqlite";

import { Buffer } from "buffer";
import { AutoConnectService } from "@/features/settings/features/ai/autoConnect/services/autoConnectService";
global.Buffer = Buffer;

export { ErrorBoundary } from "expo-router";

// Prevent splash auto hide until we say so
SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

export default function RootLayout() {
  const { colorScheme, setColorScheme } = useColorScheme();

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
      // Theme Logic
      const storedTheme = getItem("theme");
      if (storedTheme) {
        const normalized = storedTheme === "dark" ? "dark" : "light";
        if (normalized !== colorScheme) setColorScheme(normalized);
        setAndroidNavigationBar(normalized);
      } else {
        setItem("theme", colorScheme);
        setAndroidNavigationBar(colorScheme);
      }

      // DB Logic
      try {
        const exists = await validateIfDBExists();
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

    // If we're navigating to (tabs) and db was previously false, re-check
    if (isNavigatingToTabs && dbExists === false) {
      validateIfDBExists()
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
   * 4. Sync Theme Changes
   */
  useEffect(() => {
    if (colorScheme) {
      setItem("theme", colorScheme);
      setAndroidNavigationBar(colorScheme);
    }
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
        <GestureHandlerRootView style={{ flex: 1 }}>
          <BottomSheetModalProvider>
            <PaperProvider>
              <ModalProvider>
                <View
                  className={cn("flex-1", colorScheme === "dark" ? "dark" : "")}
                >
                  <LlamaProvider>
                    <StatusBar
                      style={colorScheme === "dark" ? "light" : "dark"}
                    />

                    <WhisperProvider>
                      <AutoConnectService>
                        <Stack screenOptions={{ headerShown: false }}>
                          <Stack.Screen name="(tabs)" />
                          <Stack.Screen name="(stack)" />
                        </Stack>
                      </AutoConnectService>
                    </WhisperProvider>
                  </LlamaProvider>
                </View>
              </ModalProvider>
              <PortalHost />
            </PaperProvider>
          </BottomSheetModalProvider>
        </GestureHandlerRootView>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
