"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MobileNav, navAriaCurrent } from "@/components/mobile-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b">
      <div className="mx-auto flex h-14 max-w-wide items-center justify-between gap-4 px-4">
        <Link href="/" className="font-semibold tracking-tight">
          {site.name}
        </Link>

        <div className="flex items-center gap-1">
          <nav aria-label="Main" className="hidden md:block">
            <ul className="flex items-center gap-1">
              {site.nav.map((item) => {
                const current = navAriaCurrent(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={current}
                      className={cn(
                        "rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:text-foreground",
                        current && "font-medium text-foreground",
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
          <ThemeToggle />
          <MobileNav pathname={pathname} />
        </div>
      </div>
    </header>
  );
}
