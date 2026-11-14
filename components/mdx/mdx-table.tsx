import type { ComponentProps } from "react";

/** GFM tables scroll sideways on small screens instead of overflowing the page. */
export function MdxTable(props: ComponentProps<"table">) {
  return (
    <div className="my-6 w-full overflow-x-auto" role="region" aria-label="Table" tabIndex={0}>
      <table {...props} />
    </div>
  );
}
