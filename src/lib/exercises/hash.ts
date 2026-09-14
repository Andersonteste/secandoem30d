/** Cálculo do SHA-256 do conteúdo do arquivo (usado para evitar duplicidade). */

export const bytesToHex = (buffer: ArrayBuffer): string =>
  Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

export const sha256Hex = async (data: ArrayBuffer): Promise<string> => {
  const digest = await crypto.subtle.digest("SHA-256", data);
  return bytesToHex(digest);
};

export const fileSha256 = async (file: Blob): Promise<string> =>
  sha256Hex(await file.arrayBuffer());
