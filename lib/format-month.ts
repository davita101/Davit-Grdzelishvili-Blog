/** Formats a YYYY-MM month as "May 2023", and "present" as "Present". */
export function formatMonth(month: string): string {
  if (month === "present") return "Present";
  const match = /^(\d{4})-(0[1-9]|1[0-2])$/.exec(month);
  if (!match) throw new Error(`Expected a YYYY-MM month or "present", got "${month}"`);
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    timeZone: "UTC",
  });
}
