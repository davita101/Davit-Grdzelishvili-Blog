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
  it("uses the site URL when set, even if the Vercel URL is set too", () => {
    expect(resolveSiteUrl("https://example.com", "preview-abc.vercel.app")).toBe("https://example.com");
    expect(resolveSiteUrl("https://example.com", undefined)).toBe("https://example.com");
  });

  it("uses https:// plus the Vercel host when only the Vercel URL is set", () => {
    expect(resolveSiteUrl(undefined, "preview-abc.vercel.app")).toBe("https://preview-abc.vercel.app");
    expect(resolveSiteUrl("", "preview-abc.vercel.app")).toBe("https://preview-abc.vercel.app");
    expect(resolveSiteUrl("   ", " preview-abc.vercel.app ")).toBe("https://preview-abc.vercel.app");
  });

  it("does not double the protocol if the Vercel URL already has one", () => {
    expect(resolveSiteUrl(undefined, "https://preview-abc.vercel.app")).toBe("https://preview-abc.vercel.app");
  });

  it("falls back to localhost when neither is set or both are blank", () => {
    expect(resolveSiteUrl(undefined)).toBe("http://localhost:3000");
    expect(resolveSiteUrl(undefined, undefined)).toBe("http://localhost:3000");
    expect(resolveSiteUrl("", "")).toBe("http://localhost:3000");
    expect(resolveSiteUrl("   ", "   ")).toBe("http://localhost:3000");
  });

  it("strips trailing slashes", () => {
    expect(resolveSiteUrl("https://example.com/")).toBe("https://example.com");
    expect(resolveSiteUrl("https://example.com///")).toBe("https://example.com");
    expect(resolveSiteUrl("https://example.com")).toBe("https://example.com");
    expect(resolveSiteUrl(undefined, "preview-abc.vercel.app/")).toBe("https://preview-abc.vercel.app");
  });
});

describe("SITE_URL from the environment", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.resetModules();
  });

  async function loadWith(siteUrl: string, vercelUrl: string) {
    vi.stubEnv("NEXT_PUBLIC_SITE_URL", siteUrl);
    vi.stubEnv("NEXT_PUBLIC_VERCEL_URL", vercelUrl);
    vi.resetModules();
    return import("@/lib/site");
  }

  it("uses NEXT_PUBLIC_SITE_URL without a trailing slash", async () => {
    const mod = await loadWith("https://example.com/", "preview-abc.vercel.app");
    expect(mod.SITE_URL).toBe("https://example.com");
    expect(mod.site.url).toBe("https://example.com");
  });

  it("uses NEXT_PUBLIC_VERCEL_URL on previews", async () => {
    const mod = await loadWith("", "preview-abc.vercel.app");
    expect(mod.SITE_URL).toBe("https://preview-abc.vercel.app");
    expect(mod.site.url).toBe("https://preview-abc.vercel.app");
  });

  it("falls back to localhost when neither is set", async () => {
    const mod = await loadWith("", "");
    expect(mod.SITE_URL).toBe("http://localhost:3000");
  });

  it("fails loudly on an invalid URL", async () => {
    await expect(loadWith("not a url", "")).rejects.toThrow();
  });
});
