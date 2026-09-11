import { customType } from "drizzle-orm/sqlite-core";

export const float32ArrayBlob = customType<{
  data: Float32Array;
  driverData: ArrayBuffer;
}>({
  dataType() {
    return "blob";
  },
  toDriver(value: Float32Array) {
    if (!value || !(value instanceof Float32Array)) {
      return new ArrayBuffer(0);
    }

    const copy = new ArrayBuffer(value.byteLength);
    new Uint8Array(copy).set(
      new Uint8Array(value.buffer, value.byteOffset, value.byteLength)
    );
    return copy;
  },
  fromDriver(value: unknown) {
    if (!value) return new Float32Array();

    // Case 1: Uint8Array (most common)
    if (value instanceof Uint8Array) {
      return new Float32Array(
        value.buffer,
        value.byteOffset,
        value.byteLength / 4
      );
    }

    // Case 2: ArrayBuffer
    if (value instanceof ArrayBuffer) {
      return new Float32Array(value);
    }

    // Case 3: number[] (some drivers do this...)
    if (Array.isArray(value)) {
      return new Float32Array(value);
    }

    console.warn("Unknown embedding format from DB:", value);
    return new Float32Array();
  },
});
