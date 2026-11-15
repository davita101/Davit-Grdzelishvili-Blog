import { afterEach, describe, expect, it, vi } from "vitest";
import robots from "@/app/robots";
import { SITE_URL } from "@/lib/site";

afterEach(() => vi.unstubAllEnvs());

describe("robots", () => {
  it("allows all in production, with the sitemap line", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    expect(robots()).toEqual({
      rules: { userAgent: "*", allow: "/" },
      sitemap: `${SITE_URL}/sitemap.xml`,
    });
  });

  it.each([["preview"], ["development"], [undefined]])("disallows all when VERCEL_ENV=%j", (env) => {
    vi.stubEnv("VERCEL_ENV", env);
    expect(robots()).toEqual({
      rules: { userAgent: "*", disallow: "/" },
      sitemap: `${SITE_URL}/sitemap.xml`,
    });
  });
});
