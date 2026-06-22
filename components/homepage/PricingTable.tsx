import Link from "next/link";

export function PricingTable() {
  return (
    <section id="pricing" className="flex flex-col gap-4">
      <p className="font-mono text-[13px] font-medium uppercase tracking-[0.12em] text-text-secondary">
        PRICING
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        <article className="flex flex-col gap-3 rounded-lg border border-border-light bg-surface p-6 card-shadow">
          <h3 className="text-lg font-semibold text-text-primary">
            Free preview
          </h3>
          <p className="font-mono text-xl font-medium text-primary">
            Unlimited watermarked previews
          </p>
          <p className="text-sm leading-relaxed text-text-secondary">
            Upload as many drafts as you want and review the rendered PDF before
            paying for the clean export.
          </p>
        </article>

        <article className="primary-glow flex flex-col gap-3 rounded-lg border border-primary bg-surface p-6 card-shadow">
          <h3 className="text-lg font-semibold text-text-primary">Download</h3>
          <p className="font-mono text-xl font-medium text-primary">
            $1 globally · ₹10 in India
          </p>
          <p className="text-sm leading-relaxed text-text-secondary">
            One-time payment per resume. No subscriptions, no recurring charges,
            and no locked-in credits.
          </p>
          <Link
            href="/login"
            className="mt-2 inline-flex h-11 w-fit items-center justify-center rounded-md bg-primary px-4 text-sm font-semibold text-text-inverse shadow-md transition-colors hover:bg-primary-hover"
          >
            Download when ready
          </Link>
        </article>
      </div>
    </section>
  );
}
