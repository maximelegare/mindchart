import * as Crypto from "expo-crypto";
import { argon2idAsync } from "@noble/hashes/argon2.js";
import { gcm } from "@noble/ciphers/aes.js";
import { utf8ToBytes } from "@noble/hashes/utils.js";
import { z } from "zod";
import { Buffer } from "buffer";
import {
  WorkspaceExportDecryptError,
  WorkspaceExportInvalidArchiveError,
} from "./workspaceExportErrors";

export const EXPORT_FORMAT_VERSION = 1;

export const EXPORT_ARGON2_PARAMS = {
  type: "argon2id" as const,
  // Lower than desktop defaults so Argon2id runs reliably on mobile JS heaps.
  memoryKiB: 8192,
  iterations: 3,
  parallelism: 1,
  hashLength: 32,
};

const SALT_LENGTH = 16;
const GCM_NONCE_LENGTH = 12;

const Argon2ParamsSchema = z.object({
  type: z.literal("argon2id"),
  memoryKiB: z.number().int().positive(),
  iterations: z.number().int().positive(),
  parallelism: z.number().int().positive(),
  hashLength: z.number().int().positive(),
});

const KeyEnvelopeSchema = z.object({
  salt: z.string().min(1),
  argon2: Argon2ParamsSchema,
  encryptedKey: z.object({
    ciphertext: z.string().min(1),
    nonce: z.string().min(1),
  }),
});

export type KeyEnvelope = z.infer<typeof KeyEnvelopeSchema>;

const ExportMetadataSchema = z.object({
  version: z.literal(EXPORT_FORMAT_VERSION),
  salt: z.string().min(1),
  argon2: Argon2ParamsSchema,
  encryptedKey: z.object({
    ciphertext: z.string().min(1),
    nonce: z.string().min(1),
  }),
  recovery: KeyEnvelopeSchema.optional(),
});

export type WorkspaceExportMetadata = z.infer<typeof ExportMetadataSchema>;

const hexToBytes = (hex: string): Uint8Array => {
  if (!/^[0-9a-f]{64}$/i.test(hex)) {
    throw new WorkspaceExportInvalidArchiveError(
      "Invalid SQLCipher key format"
    );
  }
  const out = new Uint8Array(32);
  for (let i = 0; i < 32; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
};

const bytesToHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("");

const toBase64 = (bytes: Uint8Array): string =>
  Buffer.from(bytes).toString("base64");

const fromBase64 = (b64: string): Uint8Array => {
  try {
    return new Uint8Array(Buffer.from(b64, "base64"));
  } catch {
    throw new WorkspaceExportInvalidArchiveError("Invalid base64 in metadata");
  }
};

const deriveExportKey = async (
  secret: string,
  salt: Uint8Array,
  params: KeyEnvelope["argon2"]
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

const decryptFromEnvelope = async (
  envelope: KeyEnvelope,
  secret: string
): Promise<string> => {
  const salt = fromBase64(envelope.salt);
  const nonce = fromBase64(envelope.encryptedKey.nonce);
  const ciphertext = fromBase64(envelope.encryptedKey.ciphertext);

  if (nonce.length !== GCM_NONCE_LENGTH) {
    throw new WorkspaceExportInvalidArchiveError(
      "Invalid nonce length in metadata"
    );
  }

  try {
    const exportKey = await deriveExportKey(secret, salt, envelope.argon2);
    const cipher = gcm(exportKey, nonce);
    const plain = cipher.decrypt(ciphertext);
    if (plain.length !== 32) {
      throw new WorkspaceExportDecryptError();
    }
    return bytesToHex(plain);
  } catch (err) {
    if (
      err instanceof WorkspaceExportInvalidArchiveError ||
      err instanceof WorkspaceExportDecryptError
    ) {
      throw err;
    }
    throw new WorkspaceExportDecryptError();
  }
};

export const parseExportMetadata = (json: string): WorkspaceExportMetadata => {
  let parsed: unknown;
  try {
    parsed = JSON.parse(json);
  } catch {
    throw new WorkspaceExportInvalidArchiveError(
      "metadata.json is not valid JSON"
    );
  }
  const result = ExportMetadataSchema.safeParse(parsed);
  if (!result.success) {
    throw new WorkspaceExportInvalidArchiveError(
      "metadata.json has an unsupported format"
    );
  }
  return result.data;
};

export const hasRecoveryEnvelope = (
  metadata: WorkspaceExportMetadata
): boolean => metadata.recovery !== undefined;

export type RecoveryExportMaterial = {
  saltBase64: string;
  derivedKey: Uint8Array;
};

export const deriveRecoveryExportKey = async (
  passphrase: string,
  saltBytes: Uint8Array
): Promise<Uint8Array> => {
  return deriveExportKey(passphrase, saltBytes, EXPORT_ARGON2_PARAMS);
};

export const buildRecoveryEnvelopeWithDerivedKey = async (
  hexKey: string,
  material: RecoveryExportMaterial
): Promise<KeyEnvelope> => {
  const nonceBytes = await Crypto.getRandomBytesAsync(GCM_NONCE_LENGTH);
  const keyBytes = hexToBytes(hexKey);
  const cipher = gcm(material.derivedKey, nonceBytes);
  const ciphertext = cipher.encrypt(keyBytes);

  return {
    salt: material.saltBase64,
    argon2: { ...EXPORT_ARGON2_PARAMS },
    encryptedKey: {
      ciphertext: toBase64(ciphertext),
      nonce: toBase64(nonceBytes),
    },
  };
};

export const encryptSqlCipherKeyWithEnvelope = async (
  hexKey: string,
  secret: string
): Promise<KeyEnvelope> => {
  const saltBytes = await Crypto.getRandomBytesAsync(SALT_LENGTH);
  const nonceBytes = await Crypto.getRandomBytesAsync(GCM_NONCE_LENGTH);
  const keyBytes = hexToBytes(hexKey);

  const exportKey = await deriveExportKey(
    secret,
    saltBytes,
    EXPORT_ARGON2_PARAMS
  );
  const cipher = gcm(exportKey, nonceBytes);
  const ciphertext = cipher.encrypt(keyBytes);

  return {
    salt: toBase64(saltBytes),
    argon2: { ...EXPORT_ARGON2_PARAMS },
    encryptedKey: {
      ciphertext: toBase64(ciphertext),
      nonce: toBase64(nonceBytes),
    },
  };
};

export const buildExportMetadata = async (
  hexKey: string,
  password: string,
  recoveryMaterial?: RecoveryExportMaterial
): Promise<WorkspaceExportMetadata> => {
  const passwordEnvelope = await encryptSqlCipherKeyWithEnvelope(
    hexKey,
    password
  );

  const metadata: WorkspaceExportMetadata = {
    version: EXPORT_FORMAT_VERSION,
    ...passwordEnvelope,
  };

  if (recoveryMaterial) {
    metadata.recovery = await buildRecoveryEnvelopeWithDerivedKey(
      hexKey,
      recoveryMaterial
    );
  }

  return metadata;
};

export const encryptSqlCipherKey = async (
  hexKey: string,
  password: string
): Promise<WorkspaceExportMetadata> => {
  return buildExportMetadata(hexKey, password);
};

export const decryptSqlCipherKey = async (
  metadata: WorkspaceExportMetadata,
  password: string
): Promise<string> => {
  return decryptFromEnvelope(metadata, password);
};

export const decryptSqlCipherKeyFromRecovery = async (
  metadata: WorkspaceExportMetadata,
  recoveryPassphrase: string
): Promise<string> => {
  if (!metadata.recovery) {
    throw new WorkspaceExportInvalidArchiveError(
      "This export does not include a recovery envelope"
    );
  }
  return decryptFromEnvelope(metadata.recovery, recoveryPassphrase);
};

export const metadataToJson = (metadata: WorkspaceExportMetadata): string =>
  JSON.stringify(metadata);
