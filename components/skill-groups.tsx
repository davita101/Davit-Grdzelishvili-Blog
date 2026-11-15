import type { SkillGroup } from "@/lib/content/schema";
import { skills as defaultSkills } from "@/content/skills";

/** Skills grouped by area, in content/skills.ts order. `skills` is a prop only for tests. */
export function SkillGroups({ skills = defaultSkills }: { skills?: SkillGroup[] }) {
  return (
    <section aria-labelledby="skills-heading" className="flex flex-col gap-6">
      <h2 id="skills-heading" className="text-2xl font-semibold tracking-tight">
        Skills
      </h2>
      <dl className="grid gap-5 sm:grid-cols-[10rem_1fr] sm:gap-x-6">
        {skills.map((group) => (
          <div key={group.area} className="contents">
            <dt className="text-sm font-medium sm:pt-0.5">{group.area}</dt>
            <dd className="-mt-3 sm:mt-0">
              <ul aria-label={group.area} className="flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-md bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
