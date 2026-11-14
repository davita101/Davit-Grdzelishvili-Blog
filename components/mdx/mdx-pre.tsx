import type { ComponentProps } from "react";
import { CopyButton } from "@/components/copy-button";
import { cn } from "@/lib/utils";

/** Code blocks get a copy button in the top-right corner. The extra top padding keeps it off the first line. */
export function MdxPre({ className, ...props }: ComponentProps<"pre">) {
  return (
    <div className="relative">
      <pre {...props} className={cn("pt-10", className)} />
      <CopyButton />
    </div>
  );
}
