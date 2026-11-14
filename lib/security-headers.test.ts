import { describe, expect, it } from "vitest";
import { buildCsp, buildSecurityHeaders, posthogOrigin } from "@/lib/security-headers";

/** Parses a CSP string into { directive: sources[] }. */
function parseCsp(csp: string): Record<string, string[]> {
  return Object.fromEntries(
    csp.split("; ").map((part) => {
      const [name, ...sources] = part.split(" ");
      return [name, sources];
    }),
  );
}

function headerMap(options?: Parameters<typeof buildSecurityHeaders>[0]) {
  return Object.fromEntries(buildSecurityHeaders(options).map((h) => [h.key, h.value]));
}

describe("buildSecurityHeaders", () => {
  it("returns the three §7 headers", () => {
    const headers = headerMap();
    expect(headers["X-Content-Type-Options"]).toBe("nosniff");
    expect(headers["Referrer-Policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["Content-Security-Policy"]).toBe(buildCsp());
  });
});

describe("buildCsp", () => {
  it("production without PostHog: the base policy only", () => {
    expect(parseCsp(buildCsp({ vercelEnv: "production" }))).toEqual({
      "default-src": ["'self'"],
      "script-src": ["'self'", "'unsafe-inline'"],
      "style-src": ["'self'", "'unsafe-inline'"],
      "img-src": ["'self'", "data:", "blob:"],
      "font-src": ["'self'"],
      "connect-src": ["'self'"],
      "frame-ancestors": ["'self'"],
      "base-uri": ["'self'"],
      "form-action": ["'self'"],
      "object-src": ["'none'"],
    });
  });

  it("adds the PostHog origin to connect-src only", () => {
    const csp = buildCsp({ posthogHost: "https://eu.i.posthog.com/", vercelEnv: "production" });
    expect(parseCsp(csp)["connect-src"]).toEqual(["'self'", "https://eu.i.posthog.com"]);
    expect(csp.match(/posthog/g)).toHaveLength(1);
  });

  it("ignores an unset or blank PostHog host", () => {
    expect(buildCsp({ posthogHost: "" })).toBe(buildCsp());
    expect(buildCsp({ posthogHost: "   " })).toBe(buildCsp());
    expect(buildCsp({ posthogHost: undefined })).not.toContain("posthog");
  });

  it("throws on an invalid PostHog host", () => {
    expect(() => buildCsp({ posthogHost: "eu.i.posthog.com" })).toThrow();
    expect(() => buildCsp({ posthogHost: "javascript:alert(1)" })).toThrow();
  });

  it("preview allows the Vercel toolbar", () => {
    const csp = parseCsp(buildCsp({ vercelEnv: "preview" }));
    expect(csp["script-src"]).toContain("https://vercel.live");
    expect(csp["connect-src"]).toContain("https://vercel.live");
    expect(csp["frame-src"]).toEqual(["https://vercel.live"]);
    // Base sources are kept.
    expect(csp["script-src"]).toContain("'self'");
  });

  it("production and local never allow vercel.live", () => {
    expect(buildCsp({ vercelEnv: "production" })).not.toContain("vercel.live");
    expect(buildCsp({ vercelEnv: "development" })).not.toContain("vercel.live");
    expect(buildCsp({})).not.toContain("vercel.live");
  });

  it("preview with PostHog has both", () => {
    const csp = parseCsp(
      buildCsp({ vercelEnv: "preview", posthogHost: "https://us.i.posthog.com" }),
    );
    expect(csp["connect-src"]).toEqual(
      expect.arrayContaining(["'self'", "https://us.i.posthog.com", "https://vercel.live"]),
    );
  });

  it("adds 'unsafe-eval' only in dev", () => {
    expect(parseCsp(buildCsp({ isDev: true }))["script-src"]).toContain("'unsafe-eval'");
    expect(buildCsp({ isDev: false })).not.toContain("unsafe-eval");
  });

  it("returns a fresh policy each call (no shared state)", () => {
    buildCsp({ vercelEnv: "preview", isDev: true });
    expect(buildCsp()).not.toMatch(/vercel\.live|unsafe-eval/);
  });
});

describe("posthogOrigin", () => {
  it("returns the origin without path or trailing slash", () => {
    expect(posthogOrigin("https://eu.i.posthog.com/ingest/")).toBe("https://eu.i.posthog.com");
  });
});
