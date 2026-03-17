export const float32ToUint8 = (arr: Float32Array): Uint8Array => {
  return new Uint8Array(arr.buffer);
};
