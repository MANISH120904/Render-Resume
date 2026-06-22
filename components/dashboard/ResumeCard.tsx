import Link from "next/link";

import type { MockResumeDraft } from "@/lib/mock/dashboard";

type Props = {
  resume: MockResumeDraft;
};

const skeletonWidths = ["w-full", "w-4/5", "w-3/5", "w-full", "w-2/3"];

export function ResumeCard({ resume }: Props) {
  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-border-light bg-surface card-shadow">
      <div className="relative bg-canvas p-4">
        <div className="relative overflow-hidden rounded-md border border-border-light bg-surface p-4">
          <span className="font-mono text-xs font-medium text-primary">
            {resume.templateLabel}
          </span>
          <span
            className="absolute right-3 top-3 h-2 w-2 rounded-full bg-primary"
            aria-hidden
          />

          <div className="mt-6 flex flex-col gap-2">
            {skeletonWidths.map((width, index) => (
              <span
                key={`${resume.id}-line-${index}`}
                className={`h-2 rounded-full bg-sunken ${width}`}
                aria-hidden
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="flex flex-col gap-1">
          <h3 className="text-base font-semibold text-text-primary">
            {resume.title}
          </h3>
          <p className="font-mono text-xs text-text-secondary">
            Template: {resume.templateLabel} · Last edited {resume.lastEdited}
          </p>
        </div>

        <div className="mt-auto flex items-center justify-between gap-3">
          <Link
            href={`/builder?resumeId=${resume.id}`}
            className="text-sm font-semibold text-text-primary transition-opacity hover:opacity-80"
          >
            Edit
          </Link>

          <button
            type="button"
            disabled
            aria-disabled="true"
            aria-label="Download — available after checkout setup"
            className="inline-flex h-11 cursor-not-allowed items-center justify-center rounded-md border border-border-light bg-surface px-4 text-sm font-semibold text-text-primary opacity-70"
          >
            Download
          </button>
        </div>
      </div>
    </article>
  );
}
