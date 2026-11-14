import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MobileNav, navAriaCurrent } from "@/components/mobile-nav";
import { FooterContent } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SkipLink } from "@/components/skip-link";
import { site } from "@/lib/site";

const pathname = vi.hoisted(() => ({ current: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.current }));

beforeEach(() => {
  pathname.current = "/";
  // next-themes (inside the header's toggle) reads matchMedia; jsdom lacks it.
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    })),
  );
});

afterEach(() => vi.unstubAllGlobals());

describe("navAriaCurrent", () => {
  it("is page on the exact path, true inside the section, else undefined", () => {
    expect(navAriaCurrent("/blog", "/blog")).toBe("page");
    expect(navAriaCurrent("/blog/my-post", "/blog")).toBe("true");
    expect(navAriaCurrent("/blogroll", "/blog")).toBeUndefined();
    expect(navAriaCurrent("/about", "/blog")).toBeUndefined();
    expect(navAriaCurrent("/about", "/")).toBeUndefined();
  });
});

describe("SiteHeader", () => {
  it("links the site name home", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("link", { name: site.name })).toHaveAttribute("href", "/");
  });

  it("renders every nav item and marks the active one with aria-current", () => {
    pathname.current = "/projects";
    render(<SiteHeader />);
    const nav = screen.getByRole("navigation", { name: "Main" });
    for (const item of site.nav) {
      const link = within(nav).getByRole("link", { name: item.label });
      expect(link).toHaveAttribute("href", item.href);
      if (item.href === "/projects") expect(link).toHaveAttribute("aria-current", "page");
      else expect(link).not.toHaveAttribute("aria-current");
    }
  });

  it("includes the theme toggle", () => {
    render(<SiteHeader />);
    expect(screen.getByRole("button", { name: "Toggle theme" })).toBeInTheDocument();
  });
});

describe("MobileNav", () => {
  it("opens from the trigger and closes when a link is chosen", () => {
    render(<MobileNav pathname="/" />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    const dialog = screen.getByRole("dialog", { name: "Menu" });
    const first = site.nav[0];
    const link = within(dialog).getByRole("link", { name: first.label });
    expect(link).toHaveAttribute("href", first.href);

    fireEvent.click(link);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("closes from its close button", () => {
    render(<MobileNav pathname="/" />);
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Close" }));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("marks the active link in the menu", () => {
    render(<MobileNav pathname="/about" />);
    fireEvent.click(screen.getByRole("button", { name: "Open menu" }));
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("aria-current", "page");
  });
});

describe("FooterContent", () => {
  it("opens external links in a new tab with noopener noreferrer", () => {
    render(<FooterContent year={2026} />);
    for (const [name, href] of [
      ["GitHub", site.links.github],
      ["LinkedIn", site.links.linkedin],
    ]) {
      const link = screen.getByRole("link", { name });
      expect(link).toHaveAttribute("href", href);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    }
  });

  it("links email as mailto and RSS in the same tab", () => {
    render(<FooterContent year={2026} />);
    const email = screen.getByRole("link", { name: "Email" });
    expect(email).toHaveAttribute("href", site.links.email);
    expect(email.getAttribute("href")).toMatch(/^mailto:/);
    expect(email).not.toHaveAttribute("target");
    expect(screen.getByRole("link", { name: "RSS" })).toHaveAttribute("href", "/rss.xml");
  });

  it("shows the year and name", () => {
    render(<FooterContent year={2026} />);
    expect(screen.getByText(`© 2026 ${site.name}`)).toBeInTheDocument();
  });
});

describe("SkipLink", () => {
  it("targets #main", () => {
    render(<SkipLink />);
    expect(screen.getByRole("link", { name: "Skip to content" })).toHaveAttribute("href", "#main");
  });
});
