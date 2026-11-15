"use client";

import { Moon, Sun } from "lucide-react";
import posthog from "posthog-js";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

/** Switches between dark and light. The icons swap with CSS, so server and client markup match. */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();

  function changeTheme() {
    const theme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(theme);
    if (posthog.__loaded) {
      posthog.capture("theme_changed", { theme });
    }
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      aria-label="Toggle theme"
      title="Toggle theme"
      onClick={changeTheme}
    >
      <Sun className="dark:hidden" aria-hidden="true" />
      <Moon className="hidden dark:block" aria-hidden="true" />
    </Button>
  );
}
