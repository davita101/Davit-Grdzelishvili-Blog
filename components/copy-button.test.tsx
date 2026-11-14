import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MdxPre } from "@/components/mdx/mdx-pre";

const writeText = vi.fn().mockResolvedValue(undefined);

beforeEach(() => {
  vi.useFakeTimers();
  writeText.mockClear();
  Object.defineProperty(navigator, "clipboard", { value: { writeText }, configurable: true });
});
afterEach(() => vi.useRealTimers());

function renderBlock() {
  render(
    <MdxPre>
      <code>
        <span data-line="">const a = 1;</span>
        {"\n"}
        <span data-line="">const b = 2;</span>
        {"\n"}
      </code>
    </MdxPre>,
  );
}

describe("CopyButton", () => {
  it("copies the raw code and shows Copied for about 2 s", async () => {
    renderBlock();
    const button = screen.getByRole("button", { name: "Copy code" });
    await act(async () => {
      fireEvent.click(button);
    });
    expect(writeText).toHaveBeenCalledWith("const a = 1;\nconst b = 2;");
    expect(screen.getByRole("button", { name: "Copied" })).toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByRole("button", { name: "Copy code" })).toBeInTheDocument();
  });

  it("stays in the Copy state when the clipboard write fails", async () => {
    writeText.mockRejectedValueOnce(new Error("denied"));
    renderBlock();
    await act(async () => {
      fireEvent.click(screen.getByRole("button", { name: "Copy code" }));
    });
    expect(screen.getByRole("button", { name: "Copy code" })).toBeInTheDocument();
  });
});
