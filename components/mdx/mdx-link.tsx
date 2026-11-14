import Link from "next/link";
import type { ComponentProps } from "react";

/** True for absolute http(s) URLs. */
export function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

/**
 * Links in posts: external URLs open in a new tab with noopener noreferrer,
 * site paths use next/link, everything else (#hash, mailto:) stays a plain <a>.
 */
export function MdxLink({ href = "", children, ...props }: ComponentProps<"a">) {
  if (isExternalHref(href)) {
    return (
      <a href={href} {...props} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  if (href.startsWith("/")) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    );
  }
  return (
    <a href={href} {...props}>
      {children}
    </a>
  );
}
