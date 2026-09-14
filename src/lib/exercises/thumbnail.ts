/** Geração da capa WebP a partir de um quadro do vídeo. */

export const THUMBNAIL_MAX_WIDTH = 640;

/**
 * Extrai um quadro do vídeo e devolve um WebP com largura máxima de 640 px.
 * Lança erro se o navegador não conseguir decodificar o vídeo.
 */
export const generateVideoThumbnail = async (
  file: Blob,
  maxWidth = THUMBNAIL_MAX_WIDTH,
): Promise<Blob> => {
  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.preload = "auto";
  video.muted = true;
  video.playsInline = true;
  video.src = url;

  try {
    await new Promise<void>((resolve, reject) => {
      const fail = () => reject(new Error("Não foi possível ler o vídeo."));
      video.onerror = fail;
      video.onloadeddata = () => resolve();
      setTimeout(fail, 15000);
    });

    const target = Math.min(Math.max(video.duration || 0, 0) * 0.25, 2);
    await new Promise<void>((resolve) => {
      video.onseeked = () => resolve();
      try {
        video.currentTime = Number.isFinite(target) ? target : 0;
      } catch {
        resolve();
      }
      setTimeout(resolve, 5000);
    });

    const ratio = video.videoWidth ? Math.min(1, maxWidth / video.videoWidth) : 1;
    const width = Math.max(1, Math.round((video.videoWidth || maxWidth) * ratio));
    const height = Math.max(1, Math.round((video.videoHeight || maxWidth) * ratio));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas indisponível.");
    ctx.drawImage(video, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.82),
    );
    if (!blob) throw new Error("Não foi possível gerar a capa.");
    return blob;
  } finally {
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(url);
  }
};

/** Capa padrão usada quando a geração a partir do vídeo falha. */
export const fallbackThumbnail = async (): Promise<Blob> => {
  const canvas = document.createElement("canvas");
  canvas.width = THUMBNAIL_MAX_WIDTH;
  canvas.height = Math.round((THUMBNAIL_MAX_WIDTH * 9) / 16);
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, "#111827");
    gradient.addColorStop(1, "#1f2937");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.8),
  );
  if (!blob) throw new Error("Não foi possível gerar a capa padrão.");
  return blob;
};
