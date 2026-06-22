type Props = {
  credits: number;
};

export function CreditBadge({ credits }: Props) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-light px-3 py-1 text-sm font-medium text-primary">
      <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
      {credits} {credits === 1 ? "credit" : "credits"}
    </span>
  );
}
