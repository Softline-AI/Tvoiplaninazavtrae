import { useState, useEffect } from 'react';
import { User } from 'lucide-react';

interface SafeImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackIcon?: boolean;
}

export function SafeImage({ src, alt, className = '', fallbackIcon = true }: SafeImageProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!src) {
      setError(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(false);

    const img = new Image();

    const timeoutId = setTimeout(() => {
      setError(true);
      setLoading(false);
    }, 2000);

    img.onload = () => {
      clearTimeout(timeoutId);
      setImageSrc(src);
      setLoading(false);
      setError(false);
    };

    img.onerror = () => {
      clearTimeout(timeoutId);
      setError(true);
      setLoading(false);
    };

    img.src = src;

    return () => {
      clearTimeout(timeoutId);
      img.onload = null;
      img.onerror = null;
    };
  }, [src]);

  if (loading) {
    return (
      <div className={`${className} bg-gray-800/30 animate-pulse flex items-center justify-center`}>
        {fallbackIcon && <User className="w-1/2 h-1/2 text-gray-600" />}
      </div>
    );
  }

  if (error || !imageSrc) {
    return (
      <div className={`${className} bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center`}>
        {fallbackIcon && <User className="w-1/2 h-1/2 text-gray-400" />}
      </div>
    );
  }

  return (
    <img
      src={imageSrc}
      alt={alt}
      className={className}
      loading="lazy"
    />
  );
}
