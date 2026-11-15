import { describe, expect, it } from "vitest";
import { ExperienceEntry, Project, SkillGroup } from "@/lib/content/schema";
import { experience } from "@/content/experience";
import { projects } from "@/content/projects";
import { skills } from "@/content/skills";

describe("projects", () => {
  it("parses against Project", () => {
    expect(Project.array().safeParse(projects).success).toBe(true);
  });

  it("has exactly one featured project", () => {
    expect(projects.filter((p) => p.featured)).toHaveLength(1);
  });

  it("uses https for every repo and live link", () => {
    const links = projects.flatMap((p) => [p.repo, p.live]).filter(Boolean);
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) {
      expect(new URL(link as string).protocol).toBe("https:");
    }
  });
});

describe("experience", () => {
  it("parses against ExperienceEntry", () => {
    expect(ExperienceEntry.array().safeParse(experience).success).toBe(true);
  });

  it("lists the newest role first", () => {
    for (const entry of experience) {
      const starts = entry.roles.map((r) => r.start);
      expect(starts).toEqual([...starts].sort().reverse());
    }
  });
});

describe("skills", () => {
  it("parses against SkillGroup", () => {
    expect(SkillGroup.array().safeParse(skills).success).toBe(true);
  });

  it("keeps the about-me table order", () => {
    expect(skills.map((s) => s.area)).toEqual([
      "Languages",
      "Frontend",
      "Backend",
      "Data",
      "Auth",
      "Testing / CI",
      "Deploy",
      "Other",
    ]);
  });
});
