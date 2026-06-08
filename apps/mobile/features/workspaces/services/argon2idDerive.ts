import { Platform } from "react-native";
import { argon2idAsync } from "@noble/hashes/argon2.js";
import { utf8ToBytes } from "@noble/hashes/utils.js";

export type Argon2idParams = {
  iterations: number;
  memoryKiB: number;
  parallelism: number;
  hashLength: number;
};

const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");

const hexToBytes = (hex: string): Uint8Array => {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
};

const deriveWithNoble = (
  secret: string,
  salt: Uint8Array,
  params: Argon2idParams
): Promise<Uint8Array> => {
  const secretBytes = utf8ToBytes(secret);
  return argon2idAsync(secretBytes, salt, {
    t: params.iterations,
    m: params.memoryKiB,
    p: params.parallelism,
    dkLen: params.hashLength,
    asyncTick: 10,
  });
};

const deriveWithNative = async (
  secret: string,
  salt: Uint8Array,
  params: Argon2idParams
): Promise<Uint8Array> => {
  const argon2 = (await import("react-native-argon2")).default;
  const { rawHash } = await argon2(secret, bytesToHex(salt), {
    iterations: params.iterations,
    memory: params.memoryKiB,
    parallelism: params.parallelism,
    hashLength: params.hashLength,
    mode: "argon2id",
    saltEncoding: "hex",
  });
  return hexToBytes(rawHash);
};

export const argon2idDerive = (
  secret: string,
  salt: Uint8Array,
  params: Argon2idParams
): Promise<Uint8Array> => {
  if (Platform.OS === "web") {
    return deriveWithNoble(secret, salt, params);
  }
  return deriveWithNative(secret, salt, params);
};
