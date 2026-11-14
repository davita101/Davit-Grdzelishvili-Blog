import Link from "next/link";
import { MobileNav, NavLinks } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { site } from "@/lib/site";

/** Server component; only the nav links, menu and toggle are client code. */
export function SiteHeader() {
  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-wide items-center justify-between gap-4 px-4">
        <Link href="/" className="font-semibold tracking-tight">
          {site.name}
        </Link>

        <div className="flex items-center gap-1">
          <NavLinks />
          <ThemeToggle />
          <MobileNav />
        </div>
      </div>
    </header>
  );
}
