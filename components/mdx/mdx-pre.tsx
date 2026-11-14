import type { ComponentProps } from "react";
import { CopyButton } from "@/components/copy-button";

/** Code blocks get a copy button in the top-right corner. */
export function MdxPre(props: ComponentProps<"pre">) {
  return (
    <div className="relative">
      <pre {...props} />
      <CopyButton />
    </div>
  );
}
