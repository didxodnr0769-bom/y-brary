"use client";

import Image, { type ImageProps } from "next/image";
import { useState } from "react";

type ContentImageProps = Omit<ImageProps, "onError" | "src"> & {
  fallbackText?: string;
  src?: ImageProps["src"] | null;
};

const defaultFallbackText = "아직 이미지가 첨부되지 않았어요.";

export function ContentImage({
  alt,
  fallbackText = defaultFallbackText,
  src,
  ...imageProps
}: ContentImageProps) {
  const [failedSrc, setFailedSrc] = useState<ImageProps["src"] | null>(null);

  if (!src || failedSrc === src) {
    return (
      <div className="image-fallback" role="img" aria-label={fallbackText}>
        <span className="image-fallback-mark" aria-hidden="true">
          □
        </span>
        <span>{fallbackText}</span>
      </div>
    );
  }

  return <Image {...imageProps} src={src} alt={alt} onError={() => setFailedSrc(src)} />;
}
