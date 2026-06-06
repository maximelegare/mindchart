// Re-export noble utils but replace the no-op nextTick that breaks argon2idAsync on React Native.
export * from "../../node_modules/@noble/hashes/utils.js";

export async function nextTick(): Promise<void> {
  await new Promise<void>((resolve) => setTimeout(resolve, 0));
}
