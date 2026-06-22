import { ArrowRight } from "lucide-react";
import Link from "next/link";

export function Hero() {
  return (
    <section className="flex flex-col gap-6">
      <p className="font-mono text-[13px] font-medium uppercase tracking-[0.12em] text-text-secondary">
        AI RESUME COMPILER
      </p>

      <h1 className="max-w-[760px] text-[40px] font-extrabold leading-[1.02] tracking-[-0.02em] text-text-primary md:text-[56px]">
        Compile your resume like
        <br />
        you compile code.
      </h1>

      <p className="max-w-[760px] text-lg leading-relaxed text-text-secondary">
        Paste raw notes or upload a messy PDF. Render Resume structures the
        content, renders it with a local LaTeX engine, and lets you preview
        before you pay to download.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <Link
          href="/login"
          className="primary-glow inline-flex h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-text-inverse shadow-md transition-colors hover:bg-primary-hover"
        >
          Get started — it&apos;s free to preview
          <ArrowRight className="h-[18px] w-[18px]" aria-hidden />
        </Link>

        <a
          href="#features"
          className="inline-flex h-11 items-center justify-center px-2 text-sm font-semibold text-text-primary transition-opacity hover:opacity-80"
        >
          See how it works
        </a>
      </div>
    </section>
  );
}
