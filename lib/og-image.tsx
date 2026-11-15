import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

/** Link-preview card size (Open Graph and Twitter). */
export const OG_SIZE = { width: 1200, height: 630 };
export const OG_CONTENT_TYPE = "image/png";

/** Dark-theme design tokens from app/globals.css, converted to hex (Satori has no oklch). */
const COLORS = {
  background: "#09090b", // --background (dark): oklch(0.141 0.005 285.823)
  foreground: "#fafafa", // --foreground (dark): oklch(0.985 0 0)
  muted: "#9f9fa9", // --muted-foreground (dark): oklch(0.705 0.015 286.067)
  accent: "#51a2ff", // --link (dark): oklch(0.707 0.165 254.624)
};

const MAX_TITLE = 90;

/** Shortens a title to at most `max` characters, at a word break when it can, with "…". */
export function truncateTitle(title: string, max: number = MAX_TITLE): string {
  const clean = title.trim().replace(/\s+/g, " ");
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max - 1);
  const space = cut.lastIndexOf(" ");
  const base = space > max * 0.6 ? cut.slice(0, space) : cut;
  return `${base.replace(/[\s.,;:!?·–-]+$/, "")}…`;
}

/** Reads a file from public/ at build time (the card routes are prerendered). */
function readPublic(file: string): Buffer {
  return fs.readFileSync(/*turbopackIgnore: true*/ path.join(process.cwd(), "public", file));
}

function toArrayBuffer(buffer: Buffer): ArrayBuffer {
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength) as ArrayBuffer;
}

/**
 * The shared 1200×630 card: blue accent bar, avatar and name, the title, and an
 * optional subtitle. Monochrome on the dark background, set in Geist from public/fonts.
 */
export function renderOgImage({ title, subtitle }: { title: string; subtitle?: string }): ImageResponse {
  const avatar = `data:image/jpeg;base64,${readPublic("avatar.jpg").toString("base64")}`;
  const text = truncateTitle(title);
  const titleSize = text.length > 60 ? 60 : 72;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: COLORS.background,
          color: COLORS.foreground,
          fontFamily: "Geist",
        }}
      >
        <div style={{ display: "flex", width: "100%", height: 12, backgroundColor: COLORS.accent }} />
        <div
          style={{
            display: "flex",
            flex: 1,
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 80px 72px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- Satori renders plain <img> only */}
            <img
              src={avatar}
              alt=""
              width={88}
              height={88}
              style={{ borderRadius: 9999, border: "2px solid rgba(255,255,255,0.15)" }}
            />
            <div style={{ display: "flex", fontSize: 34, fontWeight: 600 }}>{site.name}</div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: titleSize,
              fontWeight: 600,
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              maxWidth: 1040,
            }}
          >
            {text}
          </div>
          <div style={{ display: "flex", fontSize: 32, color: COLORS.muted, minHeight: 40 }}>{subtitle ?? ""}</div>
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Geist", data: toArrayBuffer(readPublic("fonts/Geist-Regular.ttf")), weight: 400, style: "normal" },
        { name: "Geist", data: toArrayBuffer(readPublic("fonts/Geist-SemiBold.ttf")), weight: 600, style: "normal" },
      ],
    },
  );
}
