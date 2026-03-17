export function float32ToBase64(arr: Float32Array) {
  let binary = "";
  const bytes = new Uint8Array(arr.buffer);
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
