import { useState } from "react";
import { Alert, Pressable, View } from "react-native";
import { Button } from "@/components/ui/button";
import { Typography } from "@/components/ui";
import { useRecoveryPassphrase } from "../hooks/useRecoveryPassphrase";

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
        "Recovery passphrase",
        e instanceof Error ? e.message : "Unknown error"
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
          Save this somewhere safe. Long-press to copy-friendly view.
        </Typography>
        <Pressable
          onLongPress={() => {
            Alert.alert("Recovery passphrase", revealedPassphrase);
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
          <Typography>Hide passphrase</Typography>
        </Button>
      </View>
    );
  }

  return (
    <View className="gap-2">
      <Typography variant="muted" padding>
        Reveal your saved recovery passphrase if you need a reminder.
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
          {loading ? "Authenticating…" : "Reveal passphrase"}
        </Typography>
      </Button>
    </View>
  );
};
