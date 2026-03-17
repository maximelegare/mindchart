function hexToUint8(hex: string) {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
  }
  return bytes;
}

export function hexToFloat32(hex: string) {
  const bytes = hexToUint8(hex);
  return new Float32Array(bytes.buffer);
}
