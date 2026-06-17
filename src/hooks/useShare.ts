import { useCallback, useMemo } from 'react';

export type ShareInput = {
  blob: Blob;
  filename: string;
  title?: string;
  text?: string;
};

export function useShare(): {
  canShare: boolean;
  share: (input: ShareInput) => Promise<boolean>;
} {
  const canShare = useMemo(
    () => typeof navigator !== 'undefined' && typeof navigator.share === 'function',
    [],
  );

  const share = useCallback(
    async ({ blob, filename, title, text }: ShareInput): Promise<boolean> => {
      if (!canShare) return false;
      const file = new File([blob], filename, { type: blob.type });
      const data: ShareData = { files: [file], title, text };
      if (navigator.canShare && !navigator.canShare(data)) return false;
      try {
        await navigator.share(data);
        return true;
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return false;
        throw err;
      }
    },
    [canShare],
  );

  return { canShare, share };
}
