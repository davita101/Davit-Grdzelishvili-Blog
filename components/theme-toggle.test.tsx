import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";

/** jsdom has no matchMedia; next-themes uses it for the system theme. */
function mockSystemTheme(dark: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: dark && query.includes("dark"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

function renderToggle() {
  return render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  );
}

const html = () => document.documentElement;

describe("ThemeToggle", () => {
  beforeEach(() => {
    localStorage.clear();
    html().className = "";
    html().style.colorScheme = "";
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("has an accessible label", () => {
    mockSystemTheme(false);
    renderToggle();
    expect(screen.getByRole("button", { name: "Toggle theme" })).toBeInTheDocument();
  });

  it("switches light → dark → light and stores the choice", () => {
    mockSystemTheme(false);
    renderToggle();
    const button = screen.getByRole("button", { name: "Toggle theme" });

    expect(html()).toHaveClass("light");

    fireEvent.click(button);
    expect(html()).toHaveClass("dark");
    expect(html()).not.toHaveClass("light");
    expect(localStorage.getItem("theme")).toBe("dark");

    fireEvent.click(button);
    expect(html()).toHaveClass("light");
    expect(localStorage.getItem("theme")).toBe("light");
  });

  it("starts from the system theme: dark system → first click gives light", () => {
    mockSystemTheme(true);
    renderToggle();

    expect(html()).toHaveClass("dark");
    fireEvent.click(screen.getByRole("button", { name: "Toggle theme" }));
    expect(html()).toHaveClass("light");
  });
});
