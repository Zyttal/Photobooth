export function captureFromVideo(
  video: HTMLVideoElement,
  options: { mirror?: boolean; quality?: number } = {},
): Promise<Blob> {
  const { mirror = false, quality = 0.92 } = options;
  const width = video.videoWidth;
  const height = video.videoHeight;
  if (!width || !height) {
    return Promise.reject(new Error('Video has no dimensions yet'));
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return Promise.reject(new Error('Canvas 2D context unavailable'));

  if (mirror) {
    ctx.translate(width, 0);
    ctx.scale(-1, 1);
  }
  ctx.drawImage(video, 0, 0, width, height);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Failed to encode captured frame'));
      },
      'image/jpeg',
      quality,
    );
  });
}
