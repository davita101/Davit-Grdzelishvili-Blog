"use client";

import posthog from "posthog-js";
import { useEffect, useRef, useState } from "react";

const RESET_MS = 2000;

/**
 * Copies the raw code of the code block it sits in. It reads the text of the
 * sibling <pre>, so line numbers and highlight markup never end up on the clipboard.
 */
export function CopyButton() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [copied, setCopied] = useState(false);

  useEffect(() => () => clearTimeout(timer.current), []);

  async function copy() {
    const code = buttonRef.current?.parentElement?.querySelector("pre")?.textContent ?? "";
    try {
      await navigator.clipboard.writeText(code.replace(/\n$/, ""));
    } catch {
      return;
    }
    if (posthog.__loaded) {
      posthog.capture("code_copied", { code_length: code.length });
    }
    setCopied(true);
    clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), RESET_MS);
  }

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={copy}
      aria-label={copied ? "Copied" : "Copy code"}
      className="absolute top-2 right-2 rounded-md border bg-background px-2 py-1 font-mono text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
    >
      <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}
