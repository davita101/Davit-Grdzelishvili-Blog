import { FeaturedProject } from "@/components/featured-project";
import { HomeHero } from "@/components/home-hero";
import { LatestPosts } from "@/components/latest-posts";

export default function Home() {
  return (
    <div className="mx-auto max-w-content px-4 py-16 sm:py-24">
      <HomeHero />
      <LatestPosts />
      <FeaturedProject />
    </div>
  );
}
