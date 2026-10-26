"use client";

import Image from "next/image";
import { useState, useEffect } from "react";
import { normalizeImageUrl } from "@/lib/utils";

interface ClassCoverImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

export function ClassCoverImage({
  src,
  alt,
  className = "object-cover",
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  priority = false,
}: ClassCoverImageProps) {
  const [imgSrc, setImgSrc] = useState<string>(normalizeImageUrl(src));

  useEffect(() => {
    setImgSrc(normalizeImageUrl(src));
  }, [src]);

  return (
    <Image
      src={imgSrc}
      alt={alt}
      fill
      priority={priority}
      className={className}
      sizes={sizes}
      onError={() => {
        if (imgSrc !== "/placeholder.svg") {
          setImgSrc("/placeholder.svg");
        }
      }}
      unoptimized={
        imgSrc.endsWith(".svg") ||
        imgSrc.startsWith("/placeholder") ||
        imgSrc.includes("localhost") ||
        (!imgSrc.startsWith("/") && !imgSrc.includes("images.unsplash.com"))
      }
    />
  );
}
