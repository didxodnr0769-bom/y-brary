import { useState, type ImgHTMLAttributes } from "react";

import type { ImageSource } from "@/lib/content/schema";
import { assetUrl } from "@/lib/urls";

type ContentImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "onError" | "src" | "alt"> & {
  alt: string;
  fallbackText?: string;
  src?: string | null;
  sources?: ImageSource[];
  fill?: boolean;
};

const defaultFallbackText = "아직 이미지가 첨부되지 않았어요.";

export function ContentImage({
  alt,
  fallbackText = defaultFallbackText,
  src,
  sources,
  srcSet,
  fill,
  style,
  ...imageProps
}: ContentImageProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

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

  return <img {...imageProps} src={assetUrl(src)} srcSet={sources?.map((source) => `${assetUrl(source.url)} ${source.width}w`).join(", ") || srcSet} alt={alt} decoding="async" style={fill ? { position: "absolute", inset: 0, width: "100%", height: "100%", ...style } : style} onError={() => setFailedSrc(src)} />;
}
