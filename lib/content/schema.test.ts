import { describe, expect, it } from "vitest";
import {
  ExperienceEntry,
  Post,
  PostFrontmatter,
  Project,
  SkillGroup,
} from "@/lib/content/schema";

const valid = {
  title: "Hello world",
  description: "A short post.",
  date: "2026-11-14",
  tags: ["nextjs", "typescript"],
};

function issuesFor(input: unknown) {
  const result = PostFrontmatter.safeParse(input);
  return result.success ? [] : result.error.issues.map((i) => i.path.join("."));
}

describe("PostFrontmatter", () => {
  it("accepts the required fields", () => {
    expect(PostFrontmatter.parse(valid)).toEqual(valid);
  });

  it("accepts every optional field", () => {
    const full = {
      ...valid,
      updated: "2026-11-20",
      draft: true,
      cover: "/posts/hello-world/cover.png",
    };
    expect(PostFrontmatter.parse(full)).toEqual(full);
  });

  it("turns a YAML Date into a YYYY-MM-DD string", () => {
    const parsed = PostFrontmatter.parse({
      ...valid,
      date: new Date("2026-11-14T00:00:00Z"),
    });
    expect(parsed.date).toBe("2026-11-14");
  });

  it.each(["title", "description", "date", "tags"])("requires %s", (field) => {
    const input: Record<string, unknown> = { ...valid };
    delete input[field];
    expect(issuesFor(input)).toContain(field);
  });

  it("accepts a 90-char title and rejects a 91-char one", () => {
    expect(issuesFor({ ...valid, title: "a".repeat(90) })).toEqual([]);
    expect(issuesFor({ ...valid, title: "a".repeat(91) })).toContain("title");
  });

  it("accepts a 200-char description and rejects a 201-char one", () => {
    expect(issuesFor({ ...valid, description: "a".repeat(200) })).toEqual([]);
    expect(issuesFor({ ...valid, description: "a".repeat(201) })).toContain(
      "description",
    );
  });

  it.each(["14-11-2026", "2026/11/14", "2026-11-14T10:00:00Z", "2026-02-30"])(
    "rejects date %s",
    (date) => {
      expect(issuesFor({ ...valid, date })).toContain("date");
    },
  );

  it("rejects a bad updated date", () => {
    expect(issuesFor({ ...valid, updated: "Nov 20, 2026" })).toContain("updated");
  });

  it("rejects an uppercase tag", () => {
    expect(issuesFor({ ...valid, tags: ["NextJS"] })).toContain("tags.0");
  });

  it("rejects 0 tags and 6 tags, accepts 1 and 5", () => {
    expect(issuesFor({ ...valid, tags: [] })).toContain("tags");
    expect(issuesFor({ ...valid, tags: ["a", "b", "c", "d", "e", "f"] })).toContain(
      "tags",
    );
    expect(issuesFor({ ...valid, tags: ["a"] })).toEqual([]);
    expect(issuesFor({ ...valid, tags: ["a", "b", "c", "d", "e"] })).toEqual([]);
  });

  it("rejects a non-boolean draft", () => {
    expect(issuesFor({ ...valid, draft: "yes" })).toContain("draft");
  });

  it("rejects a cover that doesn't start with /", () => {
    expect(issuesFor({ ...valid, cover: "posts/x/cover.png" })).toContain("cover");
    expect(issuesFor({ ...valid, cover: "https://example.com/c.png" })).toContain(
      "cover",
    );
  });

  it("rejects unknown fields", () => {
    expect(PostFrontmatter.safeParse({ ...valid, tag: ["x"] }).success).toBe(false);
  });
});

describe("Post", () => {
  const post = {
    ...valid,
    slug: "hello-world",
    readingTime: 3,
    headings: [
      { depth: 2, text: "Intro", id: "intro" },
      { depth: 3, text: "Details", id: "details" },
    ],
  };

  it("accepts frontmatter plus derived fields", () => {
    expect(Post.parse(post)).toEqual(post);
  });

  it("rejects a non-kebab slug", () => {
    expect(Post.safeParse({ ...post, slug: "Hello_World" }).success).toBe(false);
  });

  it("rejects heading depths other than 2 and 3", () => {
    const headings = [{ depth: 1, text: "Title", id: "title" }];
    expect(Post.safeParse({ ...post, headings }).success).toBe(false);
  });

  it("rejects a non-positive reading time", () => {
    expect(Post.safeParse({ ...post, readingTime: 0 }).success).toBe(false);
  });
});

describe("site data schemas", () => {
  it("Project: accepts optional links and rejects an empty stack", () => {
    const project = {
      name: "Example",
      description: "An example project.",
      stack: ["Next.js"],
      repo: "https://github.com/example/example",
      featured: true,
    };
    expect(Project.parse(project)).toEqual(project);
    expect(Project.safeParse({ ...project, stack: [] }).success).toBe(false);
    expect(Project.safeParse({ ...project, live: "not a url" }).success).toBe(false);
  });

  it("ExperienceEntry: accepts YYYY-MM and present, rejects other formats", () => {
    const entry = {
      company: "Example Co",
      employmentType: "Full-time",
      location: "Remote",
      start: "2023-05",
      end: "present",
      roles: [{ title: "Developer", start: "2024-06", end: "present", bullets: ["Built things."] }],
    };
    expect(ExperienceEntry.parse(entry)).toEqual(entry);
    expect(ExperienceEntry.safeParse({ ...entry, start: "May 2023" }).success).toBe(false);
    expect(ExperienceEntry.safeParse({ ...entry, end: "2023-13" }).success).toBe(false);
    expect(ExperienceEntry.safeParse({ ...entry, roles: [] }).success).toBe(false);
  });

  it("SkillGroup: rejects an empty item list", () => {
    expect(SkillGroup.parse({ area: "Languages", items: ["TypeScript"] })).toBeTruthy();
    expect(SkillGroup.safeParse({ area: "Languages", items: [] }).success).toBe(false);
  });
});
