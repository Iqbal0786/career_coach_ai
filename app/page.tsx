import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-stone-50 text-stone-950">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-4 sm:px-6">
        <header className="flex items-center justify-between border-b border-stone-200 py-5">
          <Link href="/" className="text-base font-semibold text-stone-950">
            AI Career Coach
          </Link>
          <Link
            href="/chat"
            className="inline-flex h-10 items-center justify-center rounded-md bg-stone-950 px-4 text-sm font-medium text-white transition hover:bg-stone-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
          >
            Open Chat
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1fr_380px]">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-teal-700">
              Career decisions made clearer
            </p>
            <h1 className="mt-4 text-4xl font-semibold tracking-normal text-stone-950 sm:text-5xl">
              Plan your next career move with an AI coach.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-stone-600">
              Get help with resumes, interview prep, role decisions, and weekly
              job-search plans in a focused chat workspace.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/chat"
                className="inline-flex h-11 items-center justify-center rounded-md bg-teal-700 px-5 text-sm font-semibold text-white transition hover:bg-teal-800 focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
              >
                Start Coaching
              </Link>
              <a
                href="#features"
                className="inline-flex h-11 items-center justify-center rounded-md border border-stone-300 px-5 text-sm font-semibold text-stone-700 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-teal-600 focus:ring-offset-2"
              >
                See Features
              </a>
            </div>
          </div>

          <div className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-stone-500">Example prompt</p>
            <p className="mt-3 text-lg font-semibold leading-7 text-stone-950">
              “I have 3 years of frontend experience. Help me move toward a
              full-stack role in 60 days.”
            </p>
            <div className="mt-5 rounded-md bg-stone-50 p-4 text-sm leading-6 text-stone-600">
              Your coach can turn that into skill priorities, project ideas,
              resume positioning, and interview practice.
            </div>
          </div>
        </section>

        <section
          id="features"
          className="grid gap-4 border-t border-stone-200 py-10 sm:grid-cols-3"
        >
          {[
            ["Resume clarity", "Rewrite bullets with stronger outcomes."],
            ["Interview prep", "Practice answers and role-specific questions."],
            ["Career planning", "Break goals into weekly actions."],
          ].map(([title, description]) => (
            <div
              key={title}
              className="rounded-lg border border-stone-200 bg-white p-5"
            >
              <h2 className="font-semibold text-stone-950">{title}</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">
                {description}
              </p>
            </div>
          ))}
        </section>
      </div>
    </main>
  );
}
