import type { ExperienceEntry } from "@/lib/content/schema";
import { experience as defaultExperience } from "@/content/experience";
import { formatMonth } from "@/lib/format-month";

/** "May 2023 – Present", with each month in a <time dateTime="YYYY-MM">. */
function DateRange({ start, end }: { start: string; end: string }) {
  return (
    <>
      <time dateTime={start}>{formatMonth(start)}</time>
      {" – "}
      {end === "present" ? <span>{formatMonth(end)}</span> : <time dateTime={end}>{formatMonth(end)}</time>}
    </>
  );
}

/** Experience from content/experience.ts. `experience` is a prop only for tests. */
export function ExperienceTimeline({ experience = defaultExperience }: { experience?: ExperienceEntry[] }) {
  return (
    <section aria-labelledby="experience-heading" className="flex flex-col gap-6">
      <h2 id="experience-heading" className="text-2xl font-semibold tracking-tight">
        Experience
      </h2>
      <ol className="flex flex-col gap-10">
        {experience.map((entry) => (
          <li key={`${entry.company}-${entry.start}`} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1">
              <h3 className="text-lg font-semibold tracking-tight">{entry.company}</h3>
              <p className="flex flex-wrap gap-x-2 text-sm text-muted-foreground">
                <span>{entry.employmentType}</span>
                <span aria-hidden="true">·</span>
                <span>{entry.location}</span>
                <span aria-hidden="true">·</span>
                <span>
                  <DateRange start={entry.start} end={entry.end} />
                </span>
              </p>
            </div>
            <ol aria-label={`Roles at ${entry.company}`} className="flex flex-col gap-8 sm:ml-1.5 sm:border-l sm:pl-6">
              {entry.roles.map((role) => (
                <li key={`${role.title}-${role.start}`} className="relative flex flex-col gap-2">
                  <span
                    aria-hidden="true"
                    className="absolute top-2 -left-[calc(1.5rem+5px)] hidden size-2.5 rounded-full border-2 border-background bg-link sm:block"
                  />
                  <h4 className="font-medium">{role.title}</h4>
                  <p className="text-sm text-muted-foreground">
                    <DateRange start={role.start} end={role.end} />
                  </p>
                  {role.bullets.length > 0 && (
                    <ul className="mt-1 flex list-disc flex-col gap-1.5 pl-5 text-muted-foreground marker:text-border">
                      {role.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ol>
          </li>
        ))}
      </ol>
    </section>
  );
}
