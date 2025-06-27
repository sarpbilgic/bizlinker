import { useState, useEffect } from 'react';
import Image from 'next/image';
import { BuildingStorefrontIcon } from '@heroicons/react/24/outline';

const DEFAULT_IMAGE = '/no-image.png';

// Known image domains that we support
const SUPPORTED_DOMAINS = [
  'static.ticimax.cloud',
  'www.durmazz.com',
  'www.teknogold.com',
  'www.kibristeknoloji.com',
  'www.irismostore.com',
  'www.sharafstore.com',
  'www.fistikbilgisayar.com',
  'iet-cdn-007.akinsofteticaret.net',
  'cdn03.ciceksepeti.com',
  'dummyimage.com',
  'as6eaty9uqeg.merlincdn.net',
  'img-bizlinkerhub.mncdn.com'
];

export default function ProductImage({ src, alt, className = '', priority = false }) {
  const [imgSrc, setImgSrc] = useState(DEFAULT_IMAGE);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!src) {
      setImgSrc(DEFAULT_IMAGE);
      return;
    }

    try {
      const url = new URL(src);
      // Check if the domain is supported
      if (SUPPORTED_DOMAINS.some(domain => url.hostname.includes(domain))) {
        setImgSrc(src);
      } else {
        // If domain is not supported, try to proxy the image through our CDN
        const encodedUrl = encodeURIComponent(src);
        setImgSrc(`https://img-bizlinkerhub.mncdn.com/proxy?url=${encodedUrl}`);
      }
    } catch (e) {
      // If URL is invalid, use default image
      setImgSrc(DEFAULT_IMAGE);
    }
  }, [src]);

  const handleError = () => {
    setHasError(true);
    setImgSrc(DEFAULT_IMAGE);
  };

  if (hasError || !src) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-gray-100 dark:bg-zinc-800 ${className}`}>
        <BuildingStorefrontIcon className="w-6 h-6 text-gray-400" />
      </div>
    );
  }

  return (
    <Image
      src={imgSrc}
      alt={alt || 'Product image'}
      fill
      className={`object-contain ${className}`}
      onError={handleError}
      priority={priority}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
} 