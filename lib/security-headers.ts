/**
 * Security headers for every route (project.md §7).
 * Pure: next.config.ts passes in the environment values.
 */

export type SecurityHeader = { key: string; value: string };

export type SecurityHeaderOptions = {
  /** NEXT_PUBLIC_POSTHOG_HOST, e.g. "https://eu.i.posthog.com". Unset or blank = no PostHog. */
  posthogHost?: string;
  /** VERCEL_ENV: "production" | "preview" | "development" | undefined (local). */
  vercelEnv?: string;
  /** true under `next dev`. */
  isDev?: boolean;
};

/**
 * Sources the Vercel toolbar needs on preview deployments.
 * https://vercel.com/docs/vercel-toolbar/managing-toolbar#using-a-content-security-policy
 */
const VERCEL_TOOLBAR: Partial<Record<string, string[]>> = {
  "script-src": ["https://vercel.live"],
  "connect-src": ["https://vercel.live", "wss://ws-us3.pusher.com"],
  "img-src": ["https://vercel.live", "https://vercel.com"],
  "style-src": ["https://vercel.live"],
  "font-src": ["https://vercel.live", "https://assets.vercel.com"],
  "frame-src": ["https://vercel.live"],
};

/** Returns the origin of the PostHog host, or undefined when it cannot be used. */
export function posthogOrigin(host: string | undefined): string | undefined {
  const value = host?.trim();
  if (!value) return undefined;

  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.origin : undefined;
  } catch {
    return undefined;
  }
}

function posthogAssetOrigin(host: string): string {
  const url = new URL(host);
  url.hostname = url.hostname.replace(".i.posthog.com", "-assets.i.posthog.com");
  return url.origin;
}

export function buildCsp(options: SecurityHeaderOptions = {}): string {
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    // 'unsafe-inline' instead of nonces: pages are statically prerendered (a nonce
    // would need a per-request render), and next-themes injects an inline script
    // to set the theme before paint.
    "script-src": ["'self'", "'unsafe-inline'"],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:"],
    "font-src": ["'self'"],
    "connect-src": ["'self'"],
    "frame-ancestors": ["'self'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "object-src": ["'none'"],
  };

  // React needs eval for dev-only debugging features. Never in builds.
  if (options.isDev) directives["script-src"].push("'unsafe-eval'");

  const posthog = posthogOrigin(options.posthogHost);
  if (posthog) {
    directives["connect-src"].push(posthog);
    directives["script-src"].push(posthogAssetOrigin(posthog));
    directives["worker-src"] = ["'self'", "blob:"];
  }

  if (options.vercelEnv === "preview") {
    for (const [name, sources] of Object.entries(VERCEL_TOOLBAR)) {
      directives[name] = [...(directives[name] ?? []), ...(sources ?? [])];
    }
  }

  return Object.entries(directives)
    .map(([name, sources]) => `${name} ${sources.join(" ")}`)
    .join("; ");
}

export function buildSecurityHeaders(options: SecurityHeaderOptions = {}): SecurityHeader[] {
  return [
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Content-Security-Policy", value: buildCsp(options) },
  ];
}
