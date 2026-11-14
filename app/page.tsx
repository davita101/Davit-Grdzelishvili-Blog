import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16">
      {/* Temporary: the header task moves the toggle. */}
      <div className="flex justify-end">
        <ThemeToggle />
      </div>
      <h1 className="text-3xl font-semibold">Coming soon</h1>
    </main>
  );
}
