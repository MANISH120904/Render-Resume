type Props = {
  downloadCredits: number;
};

export function CreditBanner({ downloadCredits }: Props) {
  return (
    <section className="flex w-full flex-col gap-4 rounded-xl bg-inverse p-6 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <p className="shrink-0 text-5xl font-semibold leading-none text-text-inverse">
          {downloadCredits}
        </p>

        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="text-sm font-medium leading-5 text-text-inverse">
            Downloads available
          </p>
          <p className="text-sm leading-relaxed text-text-tertiary">
            You have one-click access to clean downloads for active resumes.
          </p>
        </div>
      </div>

      <button
        type="button"
        disabled
        aria-disabled="true"
        aria-label="Buy credits — available after Stripe setup"
        className="inline-flex h-11 shrink-0 cursor-not-allowed items-center justify-center self-start rounded-md bg-surface px-5 text-sm font-semibold text-text-primary opacity-70 sm:self-center"
      >
        Buy credits
      </button>
    </section>
  );
}
