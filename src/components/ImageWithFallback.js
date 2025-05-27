
'use client';
import { useState } from 'react';

export default function ImageWithFallback({ src, alt, ...props }) {
  const [error, setError] = useState(false);
  return (
    <img
      src={error ? '/fallback.png' : src}
      alt={alt}
      onError={() => setError(true)}
      {...props}
    />
  );
}
