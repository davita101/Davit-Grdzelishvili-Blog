import { describe, expect, it } from "vitest";
import { blogPostingJsonLd, personJsonLd, serializeJsonLd } from "@/lib/json-ld";
import { site } from "@/lib/site";

const post = {
  slug: "hello-world",
  title: "Hello world",
  description: "A first post.",
  date: "2026-11-12",
};

describe("personJsonLd", () => {
  it("builds a Person from lib/site.ts", () => {
    expect(personJsonLd(site)).toEqual({
      "@context": "https://schema.org",
      "@type": "Person",
      name: site.name,
      url: site.url,
      jobTitle: site.headline,
      sameAs: [site.links.github, site.links.linkedin],
    });
  });
});

describe("blogPostingJsonLd", () => {
  it("builds a BlogPosting with author, url and mainEntityOfPage", () => {
    const url = `${site.url}/blog/hello-world`;
    expect(blogPostingJsonLd(post, site)).toEqual({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: "Hello world",
      description: "A first post.",
      datePublished: "2026-11-12",
      dateModified: "2026-11-12",
      author: { "@type": "Person", name: site.name, url: site.url },
      url,
      mainEntityOfPage: { "@type": "WebPage", "@id": url },
    });
  });

  it("uses updated as dateModified when set", () => {
    expect(blogPostingJsonLd({ ...post, updated: "2026-11-14" }, site).dateModified).toBe("2026-11-14");
  });
});

describe("serializeJsonLd", () => {
  it("escapes every < so content cannot close the script tag", () => {
    const evil = blogPostingJsonLd({ ...post, title: "</script><script>alert(1)</script>" }, site);
    const json = serializeJsonLd(evil);
    expect(json).not.toContain("<");
    expect(json).toContain("\\u003c/script>\\u003cscript>");
  });

  it("still parses back to the same data", () => {
    const data = blogPostingJsonLd({ ...post, title: "a < b </script>" }, site);
    expect(JSON.parse(serializeJsonLd(data))).toEqual(data);
  });
});
