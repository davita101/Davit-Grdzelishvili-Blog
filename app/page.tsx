import type { Metadata } from "next";
import { FeaturedProject } from "@/components/featured-project";
import { HomeHero } from "@/components/home-hero";
import { LatestPosts } from "@/components/latest-posts";
import { personJsonLd, serializeJsonLd } from "@/lib/json-ld";
import { SITE_URL, site } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { canonical: SITE_URL },
};

export default function Home() {
  return (
    <div className="mx-auto max-w-content px-4 py-16 sm:py-24">
      <script
        type="application/ld+json"
        // serializeJsonLd escapes "<", so the data cannot close this tag.
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(personJsonLd(site)) }}
      />
      <HomeHero />
      <LatestPosts />
      <FeaturedProject />
    </div>
  );
}
