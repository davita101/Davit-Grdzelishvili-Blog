import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SkillGroups } from "@/components/skill-groups";
import { skills } from "@/content/skills";

describe("SkillGroups", () => {
  it("has a Skills heading", () => {
    render(<SkillGroups />);
    expect(screen.getByRole("heading", { level: 2, name: "Skills" })).toBeInTheDocument();
  });

  it("renders every group in content/skills.ts order", () => {
    render(<SkillGroups />);
    const areas = screen.getAllByRole("term").map((t) => t.textContent);
    expect(areas).toEqual(skills.map((s) => s.area));
    expect(areas).toHaveLength(8);
  });

  it("renders each group's items as chips", () => {
    render(<SkillGroups skills={[{ area: "Auth", items: ["Clerk", "Other"] }]} />);
    const chips = within(screen.getByRole("list", { name: "Auth" })).getAllByRole("listitem");
    expect(chips.map((c) => c.textContent)).toEqual(["Clerk", "Other"]);
  });
});
