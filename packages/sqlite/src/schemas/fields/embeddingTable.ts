import { customType } from "drizzle-orm/sqlite-core";

export const float32ArrayBlob = customType<{
  data: Float32Array;
  driverData: any;
}>({
  dataType() {
    return "blob";
  },
  toDriver(value: Float32Array) {
    if (!value || !(value instanceof Float32Array)) {
      return new ArrayBuffer(0);
    }

    // We slice to get a clean ArrayBuffer.
    // We cast to 'any' to satisfy Drizzle's requirement of (ArrayBuffer | SQL)
    return value.buffer.slice(
      value.byteOffset,
      value.byteOffset + value.byteLength
    ) as any;
  },
  fromDriver(value: unknown) {
    if (value instanceof Uint8Array) {
      return new Float32Array(
        value.buffer,
        value.byteOffset,
        value.byteLength / 4
      );
    }
    return new Float32Array();
  },
});
