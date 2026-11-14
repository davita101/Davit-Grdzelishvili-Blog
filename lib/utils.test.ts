import { describe, expect, it } from "vitest";
import { cn } from "@/lib/utils";

describe("cn", () => {
  it("joins class names", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("drops falsy values and handles conditional objects", () => {
    expect(cn("base", false, null, undefined, { active: true, hidden: false })).toBe(
      "base active",
    );
  });

  it("resolves Tailwind conflicts with the last class winning", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
    expect(cn("text-sm text-zinc-500", "text-lg")).toBe("text-zinc-500 text-lg");
    expect(cn("bg-red-500", "bg-zinc-900")).toBe("bg-zinc-900");
  });
});
