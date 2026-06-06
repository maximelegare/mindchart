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
        "Recovery failed",
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
    return (
      <Typography variant="muted" padding>
        Enable Recovery Password and choose a passphrase to view it here later.
      </Typography>
    );
  }

  if (revealedPassphrase) {
    return (
      <View className="gap-2">
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
        <Typography variant="muted" padding>
          Long-press to view the full passphrase. Save it somewhere safe.
        </Typography>
        <Button variant="outline" size="sm" onPress={hidePassphrase}>
          <Typography>Hide passphrase</Typography>
        </Button>
      </View>
    );
  }

  return (
    <View className="gap-2">
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
