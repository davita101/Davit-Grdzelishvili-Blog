import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ExperienceTimeline } from "@/components/experience-timeline";
import { experience } from "@/content/experience";
import type { ExperienceEntry } from "@/lib/content/schema";

const entry: ExperienceEntry = {
  company: "Sample Co",
  employmentType: "Part-time",
  location: "Remote",
  start: "2020-01",
  end: "2022-03",
  roles: [
    { title: "Senior", start: "2021-02", end: "2022-03", bullets: ["Led things.", "Shipped things."] },
    { title: "Junior", start: "2020-01", end: "2021-01", bullets: [] },
  ],
};

describe("ExperienceTimeline", () => {
  it("has an Experience h2 and an h3 per company", () => {
    render(<ExperienceTimeline experience={[entry]} />);
    expect(screen.getByRole("heading", { level: 2, name: "Experience" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "Sample Co" })).toBeInTheDocument();
    expect(screen.getByText("Part-time")).toBeInTheDocument();
    expect(screen.getByText("Remote")).toBeInTheDocument();
  });

  it("lists roles in an ordered list, in data order, with their bullets", () => {
    render(<ExperienceTimeline experience={[entry]} />);
    const roles = screen.getByRole("list", { name: "Roles at Sample Co" });
    expect(roles.tagName).toBe("OL");
    expect(within(roles).getAllByRole("heading", { level: 4 }).map((h) => h.textContent)).toEqual(["Senior", "Junior"]);
    expect(screen.getByText("Led things.")).toBeInTheDocument();
    expect(screen.getByText("Shipped things.")).toBeInTheDocument();
  });

  it("puts YYYY-MM dateTime on each <time>, and shows present as Present", () => {
    const { container } = render(<ExperienceTimeline />);
    const times = [...container.querySelectorAll("time")];
    expect(times.length).toBeGreaterThan(0);
    for (const t of times) expect(t.getAttribute("datetime")).toMatch(/^\d{4}-(0[1-9]|1[0-2])$/);
    expect(container.querySelector('time[datetime="2023-05"]')).toHaveTextContent("May 2023");
    expect(container.querySelector('time[datetime="2024-06"]')).toHaveTextContent("Jun 2024");
    expect(screen.getAllByText("Present").length).toBeGreaterThan(0);
  });

  it("renders every role and bullet from content/experience.ts", () => {
    render(<ExperienceTimeline />);
    for (const e of experience) {
      expect(screen.getByRole("heading", { level: 3, name: e.company })).toBeInTheDocument();
      for (const role of e.roles) {
        expect(screen.getByRole("heading", { level: 4, name: role.title })).toBeInTheDocument();
        for (const bullet of role.bullets) expect(screen.getByText(bullet)).toBeInTheDocument();
      }
    }
  });
});
