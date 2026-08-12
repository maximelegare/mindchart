import { EnableRecoveryPassphrase } from "../components/enableRecoveryPassword";

/** Recovery passphrase UI (parent settings sheet scrolls). */
export const RecoveryPassphraseFeature = () => {
  return <EnableRecoveryPassphrase />;
};

/** @deprecated Use RecoveryPassphraseFeature */
export const RecoveryPasswordFeature = RecoveryPassphraseFeature;
