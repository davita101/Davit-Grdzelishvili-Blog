import type { Metadata } from "next";
import Image from "next/image";
import { AboutBio } from "@/components/about-bio";
import { ContactBlock } from "@/components/contact-block";
import { ExperienceTimeline } from "@/components/experience-timeline";
import { SkillGroups } from "@/components/skill-groups";
import { SITE_URL, site } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description: `About ${site.name}: ${site.headline}.`,
  alternates: { canonical: `${SITE_URL}/about` },
};

export default function AboutPage() {
  return (
    <div className="mx-auto flex max-w-content flex-col gap-12 px-4 py-12 sm:py-16">
      <section aria-labelledby="about-name" className="flex flex-col gap-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Image
            src={site.avatar}
            alt={`Portrait of ${site.name}`}
            width={112}
            height={112}
            preload
            className="size-24 rounded-full border object-cover sm:size-28"
          />
          <div className="flex flex-col gap-1">
            <h1 id="about-name" className="text-3xl font-semibold tracking-tight sm:text-4xl">
              {site.name}
            </h1>
            <p className="text-xl font-medium">{site.headline}</p>
            <p className="text-muted-foreground">{site.headlineStack}</p>
          </div>
        </div>
        <AboutBio />
      </section>

      <ExperienceTimeline />

      <SkillGroups />
      <ContactBlock />
    </div>
  );
}
