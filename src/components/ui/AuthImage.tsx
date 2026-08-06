import { useState, useEffect } from 'react';

interface AuthImageProps {
  src: string;
  alt?: string;
  style?: React.CSSProperties;
  className?: string;
  onClick?: () => void;
}

export function AuthImage({ src, alt, style, onClick }: AuthImageProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const token = localStorage.getItem('token');

    fetch(src, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.blob())
      .then((blob) => {
        if (!cancelled) setBlobUrl(URL.createObjectURL(blob));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [src]);

  if (!blobUrl) return null;

  return <img src={blobUrl} alt={alt} style={style} onClick={onClick} />;
}
