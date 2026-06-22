import Link from "next/link";

export function CreateNewResumeCard() {
  return (
    <section className="flex flex-col gap-4 rounded-lg border border-border-light bg-surface p-6 card-shadow sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary-muted">
          <span
            className="font-mono text-lg font-semibold leading-none text-primary"
            aria-hidden
          >
            {"{ }"}
          </span>
        </div>

        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-text-primary">
            Start a new resume
          </h2>
          <p className="text-sm leading-relaxed text-text-secondary">
            Upload a PDF or paste your experience and begin a new draft.
          </p>
        </div>
      </div>

      <Link
        href="/builder"
        className="inline-flex h-11 shrink-0 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-text-inverse shadow-md transition-colors hover:bg-primary-hover"
      >
        Upload resume
      </Link>
    </section>
  );
}
