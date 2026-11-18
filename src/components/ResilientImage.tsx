import React, { useState } from 'react';
import { Film } from 'lucide-react';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackTitle?: string;
}

export const ResilientImage: React.FC<ResilientImageProps> = ({
  src,
  alt,
  className = '',
  fallbackTitle,
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#0F172A] via-[#131C31] to-[#1E1B2E] text-slate-400 p-4 select-none ${className}`}
        role="img"
        aria-label={alt}
      >
        <Film className="w-7 h-7 text-slate-500 mb-2" aria-hidden="true" />
        {fallbackTitle && (
          <span className="text-xs font-medium text-slate-300 text-center line-clamp-2">
            {fallbackTitle}
          </span>
        )}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
};
