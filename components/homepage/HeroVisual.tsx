import type { ReactNode } from "react";

const rawLines = [
  "PRIYA DESHMUKH",
  "frontend engineer | product thinker",
  "email: priya at renderresume dot dev",
  "github.com/priya-dh",
  "work: shipped resume builder, design system, payroll UI",
  "skills: ts react node postgres",
  "education: btech cs 2019",
];

const watermarkBraces = [
  { left: "8%", top: "3%" },
  { left: "28%", top: "9%" },
  { left: "52%", top: "14%" },
  { left: "74%", top: "21%" },
  { left: "16%", top: "33%" },
  { left: "42%", top: "39%" },
  { left: "66%", top: "45%" },
  { left: "19%", top: "60%" },
  { left: "46%", top: "68%" },
  { left: "71%", top: "76%" },
  { left: "26%", top: "86%" },
  { left: "48%", top: "85%" },
];

export function HeroVisual() {
  return (
    <section className="flex flex-col items-center gap-6 lg:flex-row lg:items-stretch">
      <div className="flex w-full max-w-[420px] flex-col gap-3 rounded-lg border border-border-light bg-sunken p-6 card-shadow lg:min-h-[560px] xl:min-h-[760px]">
        <p className="font-mono text-[13px] font-medium uppercase tracking-[0.12em] text-text-secondary">
          RAW INPUT
        </p>
        <p className="text-base font-semibold text-text-primary">
          Messy text from a PDF or clipboard
        </p>
        <div className="flex flex-1 flex-col gap-2.5 rounded-md border border-border-light bg-surface-secondary p-5">
          {rawLines.map((line) => (
            <p
              key={line}
              className="font-mono text-sm leading-relaxed text-text-primary"
            >
              {line}
            </p>
          ))}
        </div>
      </div>

      <div className="flex w-20 shrink-0 flex-col items-center justify-center gap-2 self-center lg:self-stretch">
        <span className="font-mono text-2xl font-medium text-primary">→</span>
        <span className="font-mono text-xs font-medium uppercase tracking-[0.12em] text-text-secondary">
          compile
        </span>
      </div>

      <div className="relative w-full max-w-[560px] overflow-hidden rounded-lg border border-border-light bg-paper elevated-shadow lg:min-h-[560px] xl:min-h-[760px]">
        {watermarkBraces.map((brace, index) => (
          <span
            key={index}
            className="pointer-events-none absolute font-mono text-5xl font-medium text-primary/10 dark:text-primary/15"
            style={{
              left: brace.left,
              top: brace.top,
              transform: "rotate(-30deg)",
            }}
            aria-hidden
          >
            {"{}"}
          </span>
        ))}

        <div className="relative flex flex-col gap-[18px] p-8 text-paper-foreground">
          <div className="flex flex-col gap-1.5">
            <h2 className="text-2xl font-bold">Priya Deshmukh</h2>
            <p className="font-mono text-xs leading-snug text-paper-muted">
              priya@renderresume.dev · +91 98765 43210 · Bengaluru, IN
            </p>
          </div>

          <ResumeSection title="SUMMARY">
            <p className="text-sm leading-relaxed text-paper-muted">
              Product-minded frontend engineer who turns messy notes into
              concise, ATS-safe resumes and builds tools that reduce manual
              formatting.
            </p>
          </ResumeSection>

          <ResumeSection title="EXPERIENCE">
            <p className="text-[15px] font-semibold">
              Senior Frontend Engineer · NovaPay
            </p>
            <p className="font-mono text-xs text-paper-muted">2022 - Present</p>
            <p className="text-sm leading-relaxed text-paper-muted">
              Shipped a resume intake flow that parsed PDF uploads into
              structured JSON and improved download conversion.
            </p>
          </ResumeSection>

          <ResumeSection title="EDUCATION">
            <p className="text-sm">B.Tech. in Computer Science · 2019</p>
          </ResumeSection>

          <ResumeSection title="SKILLS">
            <p className="text-sm leading-relaxed text-paper-muted">
              TypeScript, React, Node.js, LaTeX, ATS optimization, product
              design systems
            </p>
          </ResumeSection>
        </div>
      </div>
    </section>
  );
}

type ResumeSectionProps = {
  title: string;
  children: ReactNode;
};

function ResumeSection({ title, children }: ResumeSectionProps) {
  return (
    <div className="flex flex-col gap-2">
      <p className="font-mono text-[13px] font-medium uppercase tracking-[0.12em] text-primary">
        {title}
      </p>
      {children}
    </div>
  );
}
