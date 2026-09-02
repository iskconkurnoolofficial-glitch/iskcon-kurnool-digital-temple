import React, { useState, useEffect } from "react";
import { getOptimizedCloudinaryUrl } from "@/utils/cloudinary";

export type ImageTargetSize =
  | "thumbnail"
  | "card"
  | "gallery"
  | "banner"
  | "hero"
  | "lightbox"
  | "full"
  | string;

export interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  target?: ImageTargetSize;
  fallbackSrc?: string;
  wrapperClassName?: string;
  showSkeleton?: boolean;
  aspectRatio?: string;
}

/**
 * OptimizedImage component to deliver maximum page load speed and smooth UX.
 * Features:
 * 1. Automatic CDN format (WebP/AVIF) and resolution optimization for Cloudinary, Unsplash, and Youtube.
 * 2. Native lazy loading with async decoding by default.
 * 3. Smooth blur-up / skeleton animation to avoid CLS (Cumulative Layout Shift).
 * 4. Graceful error handling with configurable fallback support.
 */
export const OptimizedImage: React.FC<OptimizedImageProps> = ({
  src,
  alt,
  target = "card",
  fallbackSrc = "https://images.unsplash.com/photo-1544967082-d9d25d867d66?auto=format&fit=crop&w=400&q=75",
  className = "",
  wrapperClassName = "",
  showSkeleton = true,
  loading = "lazy",
  decoding = "async",
  aspectRatio,
  onLoad,
  onError,
  style,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [imgSrc, setImgSrc] = useState<string>("");

  useEffect(() => {
    if (!src) {
      setImgSrc(fallbackSrc);
      return;
    }
    const optimized = getOptimizedCloudinaryUrl(src, target);
    setImgSrc(optimized);
    setIsLoaded(false);
    setHasError(false);
  }, [src, target, fallbackSrc]);

  const handleLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError && fallbackSrc && imgSrc !== fallbackSrc) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
    if (onError) onError(e);
  };

  return (
    <div
      className={`relative overflow-hidden ${wrapperClassName}`}
      style={aspectRatio ? { aspectRatio, ...style } : style}
    >
      {showSkeleton && !isLoaded && (
        <div className="absolute inset-0 bg-slate-200/70 dark:bg-slate-800/70 animate-pulse transition-opacity duration-300 pointer-events-none z-0" />
      )}
      <img
        src={imgSrc || fallbackSrc}
        alt={alt}
        loading={loading}
        decoding={decoding}
        onLoad={handleLoad}
        onError={handleError}
        className={`w-full h-full object-cover transition-opacity duration-300 ${
          isLoaded ? "opacity-100" : "opacity-0"
        } ${className}`}
        {...props}
      />
    </div>
  );
};

export default OptimizedImage;
