import { afterEach, describe, expect, it, vi } from "vitest";
import { SiteConfig } from "@/lib/content/schema";
import { resolveSiteUrl, site } from "@/lib/site";

describe("site", () => {
  it("parses against SiteConfig", () => {
    expect(SiteConfig.safeParse(site).success).toBe(true);
  });

  it("links the email as mailto and nav as site paths", () => {
    expect(site.links.email).toBe(`mailto:${site.email}`);
    expect(site.nav.map((n) => n.href)).toEqual(["/blog", "/projects", "/about"]);
  });
});

describe("resolveSiteUrl", () => {
  it("falls back to localhost when unset or blank", () => {
    expect(resolveSiteUrl(undefined)).toBe("http://localhost:3000");
    expect(resolveSiteUrl("")).toBe("http://localhost:3000");
    expect(resolveSiteUrl("   ")).toBe("http://localhost:3000");
  });

  it("strips trailing slashes", () => {
    expect(resolveSiteUrl("https://example.com/")).toBe("https://example.com");
    expect(resolveSiteUrl("https://example.com///")).toBe("https://example.com");
    expect(resolveSiteUrl("https://example.com")).toBe("https://example.com");
  });
});

describe("SITE_URL from NEXT_PUBLIC_SITE_URL", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  it("uses the env value without a trailing slash", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "https://example.com/");
    vi.resetModules();
    const mod = await import("@/lib/site");
    expect(mod.SITE_URL).toBe("https://example.com");
    expect(mod.site.url).toBe("https://example.com");
  });

  it("falls back when the env value is empty", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "");
    vi.resetModules();
    const mod = await import("@/lib/site");
    expect(mod.SITE_URL).toBe("http://localhost:3000");
  });

  it("fails loudly on an invalid URL", async () => {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", "not a url");
    vi.resetModules();
    await expect(import("@/lib/site")).rejects.toThrow();
  });
});
