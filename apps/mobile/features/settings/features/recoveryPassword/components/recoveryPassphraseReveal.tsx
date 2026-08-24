import { useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui";
import { useRecoveryPassphrase } from "../hooks/useRecoveryPassphrase";
import {
  SettingsRecoveryPassphraseRevealReminderDescription,
  SettingsRecoveryPassphraseRevealSavedDescription,
  settingsRecoveryPassphraseAlertTitle,
  settingsRecoveryPassphraseAuthenticating,
  settingsRecoveryPassphraseHideButton,
  settingsRecoveryPassphraseRevealButton,
} from "@/features/settings/features/recoveryPassword/labels/settingsRecoveryLabels";
import { settingsCommonUnknownError } from "@/features/settings/settingsLabels";

const MASKED_PASSPHRASE = "••••••••••••••••••••••••••••••••";

export const RecoveryPassphraseReveal = () => {
  const [revealedPassphrase, setRevealedPassphrase] = useState<
    string | undefined
  >();
  const [loading, setLoading] = useState(false);

  const { recoveryPassphraseEnabled, revealRecoveryPassphrase } =
    useRecoveryPassphrase();

  const handleReveal = async () => {
    setLoading(true);
    try {
      const passphrase = await revealRecoveryPassphrase();
      setRevealedPassphrase(passphrase);
    } catch (e) {
      Alert.alert(
        settingsRecoveryPassphraseAlertTitle(),
        e instanceof Error ? e.message : settingsCommonUnknownError()
      );
    } finally {
      setLoading(false);
    }
  };

  const hidePassphrase = () => {
    setRevealedPassphrase(undefined);
  };

  if (!recoveryPassphraseEnabled) {
    return null;
  }

  if (revealedPassphrase) {
    return (
      <View className="gap-2">
        <Typography variant="muted" padding>
          <SettingsRecoveryPassphraseRevealSavedDescription />
        </Typography>
        <Pressable
          onLongPress={() => {
            Alert.alert(
              settingsRecoveryPassphraseAlertTitle(),
              revealedPassphrase
            );
          }}
        >
          <View className="rounded-md bg-muted p-3">
            <Typography
              variant="small"
              className="font-mono text-foreground break-all"
            >
              {revealedPassphrase}
            </Typography>
          </View>
        </Pressable>
        <Button variant="outline" size="sm" onPress={hidePassphrase}>
          <Typography>{settingsRecoveryPassphraseHideButton()}</Typography>
        </Button>
      </View>
    );
  }

  return (
    <View className="gap-2">
      <Typography variant="muted" padding>
        <SettingsRecoveryPassphraseRevealReminderDescription />
      </Typography>
      <View className="rounded-md bg-muted p-3">
        <Typography variant="small" className="font-mono text-muted-foreground">
          {MASKED_PASSPHRASE}
        </Typography>
      </View>
      <Button
        variant="default"
        size="sm"
        disabled={loading}
        onPress={() => {
          void handleReveal();
        }}
      >
        <Typography>
          {loading
            ? settingsRecoveryPassphraseAuthenticating()
            : settingsRecoveryPassphraseRevealButton()}
        </Typography>
      </Button>
    </View>
  );
};
