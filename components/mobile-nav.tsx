"use client";

import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { site } from "@/lib/site";
import { cn } from "@/lib/utils";

/**
 * aria-current for a nav item: "page" on the item's own page, "true" inside its
 * section (e.g. /blog/my-post under Blog), otherwise undefined.
 */
export function navAriaCurrent(pathname: string, href: string): "page" | "true" | undefined {
  if (pathname === href) return "page";
  if (href !== "/" && pathname.startsWith(`${href}/`)) return "true";
  return undefined;
}

/** Inline nav for 768 px and up. Client only for the active-link state. */
export function NavLinks() {
  const pathname = usePathname();

  return (
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
  );
}

/** Nav in a sheet below 768 px. Closes when a link is chosen. */
export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button type="button" variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
          <Menu aria-hidden="true" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" aria-describedby={undefined}>
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
        </SheetHeader>
        <nav aria-label="Mobile">
          <ul className="flex flex-col px-2">
            {site.nav.map((item) => {
              const current = navAriaCurrent(pathname, item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={current}
                    onClick={() => setOpen(false)}
                    className={cn(
                      "block rounded-md px-3 py-3 text-base text-muted-foreground hover:bg-muted hover:text-foreground",
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
      </SheetContent>
    </Sheet>
  );
}
