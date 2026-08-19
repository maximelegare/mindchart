export const APP_PIN_LENGTH = 6;

export const APP_PIN_ARGON2_PARAMS = {
  iterations: 2,
  memoryKiB: 8192,
  parallelism: 1,
  hashLength: 32,
} as const;
