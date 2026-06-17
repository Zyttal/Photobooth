export function fileToImage(input: Blob | string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = typeof input === 'string' ? input : URL.createObjectURL(input);
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      resolve(img);
    };
    img.onerror = () => {
      if (typeof input !== 'string') URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}
