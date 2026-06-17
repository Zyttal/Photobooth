import { useEffect, useRef, useState } from 'react';

export function useObjectUrl(source: Blob | null | undefined): string | null {
  const [tracked, setTracked] = useState<{
    src: Blob | null | undefined;
    url: string | null;
  }>(() => ({
    src: source,
    url: source ? URL.createObjectURL(source) : null,
  }));

  if (source !== tracked.src) {
    if (tracked.url) URL.revokeObjectURL(tracked.url);
    setTracked({
      src: source,
      url: source ? URL.createObjectURL(source) : null,
    });
  }

  const urlRef = useRef<string | null>(tracked.url);
  useEffect(() => {
    urlRef.current = tracked.url;
  }, [tracked.url]);
  useEffect(
    () => () => {
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    },
    [],
  );

  return tracked.url;
}
