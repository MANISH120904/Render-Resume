import Link from "next/link";
import { FileText } from "lucide-react";

import type { MockResumeDraft } from "@/lib/mock/dashboard";

import { ResumeCard } from "@/components/dashboard/ResumeCard";

type Props = {
  resumes: MockResumeDraft[];
};

export function ResumeGrid({ resumes }: Props) {
  const draftCount = resumes.length;

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold text-text-primary">
          Your resumes
        </h2>
        {draftCount > 0 ? (
          <p className="font-mono text-xs text-text-secondary">
            {draftCount} {draftCount === 1 ? "draft" : "drafts"} · all ATS-safe
          </p>
        ) : null}
      </div>

      {draftCount === 0 ? (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-border-light bg-surface p-10 text-center card-shadow">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-muted">
            <FileText className="h-5 w-5 text-primary" aria-hidden />
          </div>
          <div className="flex max-w-sm flex-col gap-1">
            <p className="text-base font-semibold text-text-primary">
              No resumes yet
            </p>
            <p className="text-sm leading-relaxed text-text-secondary">
              Upload a PDF or paste your experience to create your first
              ATS-safe draft.
            </p>
          </div>
          <Link
            href="/builder"
            className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-5 text-sm font-semibold text-text-inverse shadow-md transition-colors hover:bg-primary-hover"
          >
            Upload your first resume
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map((resume) => (
            <ResumeCard key={resume.id} resume={resume} />
          ))}
        </div>
      )}
    </section>
  );
}
