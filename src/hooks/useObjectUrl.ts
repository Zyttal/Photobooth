import { useEffect, useState } from 'react';

/**
 * Wrap a Blob in an object URL. Returns null until the URL is ready.
 *
 * Revoke is delayed past the next tick so React StrictMode's
 * double-mount in dev doesn't tear down the URL the browser is mid-fetch on.
 * In production (no double-mount) the delay is harmless.
 */
export function useObjectUrl(source: Blob | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!source) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUrl(null);
      return;
    }
    const next = URL.createObjectURL(source);
    setUrl(next);
    return () => {
      window.setTimeout(() => URL.revokeObjectURL(next), 1500);
    };
  }, [source]);

  return url;
}
