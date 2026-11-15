import { OG_CONTENT_TYPE, OG_SIZE, renderOgImage } from "@/lib/og-image";
import { site } from "@/lib/site";

export const alt = `${site.name}: ${site.headline}`;
export const size = OG_SIZE;
export const contentType = OG_CONTENT_TYPE;

/** Default link-preview card for every page without its own. */
export default function OpengraphImage() {
  return renderOgImage({ title: site.headline, subtitle: site.headlineStack });
}
