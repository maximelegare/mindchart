import * as Crypto from "expo-crypto";
import { Buffer } from "buffer";
import { argon2idDerive } from "@/features/workspaces/services/argon2idDerive";
import { APP_PIN_ARGON2_PARAMS } from "../constants";
import * as store from "./passcodeStore";

const SALT_LENGTH = 16;

const toBase64 = (bytes: Uint8Array): string =>
  Buffer.from(bytes).toString("base64");

const fromBase64 = (b64: string): Uint8Array =>
  new Uint8Array(Buffer.from(b64, "base64"));

const bytesEqual = (a: Uint8Array, b: Uint8Array): boolean => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a[i]! ^ b[i]!;
  }
  return diff === 0;
};

export async function hasAppPin(): Promise<boolean> {
  const hash = await store.getPinHash();
  return hash != null && hash.length > 0;
}

export async function setAppPin(pin: string): Promise<void> {
  const saltBytes = await Crypto.getRandomBytesAsync(SALT_LENGTH);
  const hash = await argon2idDerive(pin, saltBytes, APP_PIN_ARGON2_PARAMS);

  try {
    await store.setPinHash(toBase64(hash));
    await store.setPinSalt(toBase64(saltBytes));
  } catch (error) {
    await clearAppPin().catch(() => undefined);
    throw error;
  }
}

export async function verifyAppPin(pin: string): Promise<boolean> {
  const saltBase64 = await store.getPinSalt();
  const hashBase64 = await store.getPinHash();
  if (!saltBase64 || !hashBase64) return false;

  const derived = await argon2idDerive(
    pin,
    fromBase64(saltBase64),
    APP_PIN_ARGON2_PARAMS
  );

  return bytesEqual(derived, fromBase64(hashBase64));
}

export async function clearAppPin(): Promise<void> {
  await store.deletePinHash();
  await store.deletePinSalt();
}

export async function changeAppPin(pin: string): Promise<void> {
  await clearAppPin();
  await setAppPin(pin);
}
