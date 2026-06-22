import { CircleDollarSign, Code, FileText } from "lucide-react";

const features = [
  {
    icon: Code,
    title: "AI-powered structuring",
    description:
      "DeepSeek turns raw input into clean JSON fields you can edit without touching formatting.",
  },
  {
    icon: FileText,
    title: "ATS-safe LaTeX templates",
    description:
      "A local render path keeps the PDF clean, sharp, and safe for applicant tracking systems.",
  },
  {
    icon: CircleDollarSign,
    title: "Pay only when you download",
    description:
      "Preview is free. Download the clean version once you're ready to pay the one-time fee.",
  },
];

export function Features() {
  return (
    <section id="features" className="flex flex-col gap-4">
      <p className="font-mono text-[13px] font-medium uppercase tracking-[0.12em] text-text-secondary">
        FEATURES
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        {features.map((feature) => (
          <article
            key={feature.title}
            className="flex flex-col gap-3 rounded-lg border border-border-light bg-surface p-6 card-shadow"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-muted">
              <feature.icon
                className="h-5 w-5 text-primary"
                aria-hidden
              />
            </div>
            <h3 className="text-lg font-semibold text-text-primary">
              {feature.title}
            </h3>
            <p className="text-sm leading-relaxed text-text-secondary">
              {feature.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
