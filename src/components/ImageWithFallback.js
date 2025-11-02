
'use client';
import { useState } from 'react';
import Image from 'next/image';

export default function ImageWithFallback({ src, alt, width = 200, height = 200, ...props }) {
  const [error, setError] = useState(false);
  return (
    <Image
      src={error ? '/fallback.png' : src}
      alt={alt || 'Image'}
      width={width}
      height={height}
      onError={() => setError(true)}
      {...props}
    />
  );
}
