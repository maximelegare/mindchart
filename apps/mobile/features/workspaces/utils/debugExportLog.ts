import Constants from "expo-constants";
import RNBlobUtil from "react-native-blob-util";

const SESSION_ID = "a6bf76";
const INGEST_PATH = "7a3c8f38-74e4-4a91-a5fb-eff7ecdcfe85";

const getIngestUrl = (): string => {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (
      Constants as {
        manifest2?: { extra?: { expoClient?: { hostUri?: string } } };
      }
    ).manifest2?.extra?.expoClient?.hostUri;
  const host = hostUri?.split(":")[0];
  const base = host && host !== "localhost" ? host : "127.0.0.1";
  return `http://${base}:7896/ingest/${INGEST_PATH}`;
};

const deviceLogPath = `${RNBlobUtil.fs.dirs.CacheDir}/debug-${SESSION_ID}.ndjson`;

export const debugExportLog = (
  location: string,
  message: string,
  data: Record<string, unknown>,
  hypothesisId: string
) => {
  const payload = {
    sessionId: SESSION_ID,
    location,
    message,
    data,
    hypothesisId,
    timestamp: Date.now(),
  };
  const line = `${JSON.stringify(payload)}\n`;

  // #region agent log
  // Use console.log — console.error triggers LogBox and covers the modal in dev.
  console.log("[DEBUG-EXPORT]", location, message, JSON.stringify(data));
  fetch(getIngestUrl(), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Debug-Session-Id": SESSION_ID,
    },
    body: JSON.stringify(payload),
  }).catch(() => {});
  RNBlobUtil.fs.appendFile(deviceLogPath, line, "utf8").catch(() => {});
  // #endregion
};
