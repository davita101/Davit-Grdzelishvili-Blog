import Image from "next/image";
import type { ComponentProps } from "react";

function toNumber(value: string | number | undefined): number | undefined {
  const n = typeof value === "string" ? Number.parseInt(value, 10) : value;
  return n && Number.isFinite(n) && n > 0 ? n : undefined;
}

/**
 * Images in posts, via next/image. Alt text is required and the image must be a
 * site path under public/ (the CSP only allows images from 'self'). A missing alt
 * or a remote src throws, so `pnpm build` fails with the image named.
 *
 * Size: width/height from the MDX (<img width height>) when given; otherwise the
 * image is fitted into a fixed 16:9 frame.
 */
export function MdxImage({ src, alt, width, height, title }: ComponentProps<"img">) {
  if (typeof src !== "string" || !src.startsWith("/")) {
    throw new Error(`MDX image "${String(src)}" must be a site path under public/, e.g. /posts/<slug>/image.png`);
  }
  if (!alt?.trim()) {
    throw new Error(`MDX image "${src}" needs alt text: ![describe the image](${src})`);
  }

  const w = toNumber(width);
  const h = toNumber(height);
  const sizes = "(min-width: 768px) 720px, 100vw";

  return (
    <figure className="my-8">
      {w && h ? (
        <Image src={src} alt={alt} width={w} height={h} sizes={sizes} className="h-auto w-full rounded-lg border" />
      ) : (
        <span className="relative block aspect-video w-full">
          <Image src={src} alt={alt} fill sizes={sizes} className="rounded-lg object-contain" />
        </span>
      )}
      {title && <figcaption className="mt-2 text-center text-sm text-muted-foreground">{title}</figcaption>}
    </figure>
  );
}
