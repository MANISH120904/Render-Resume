import { BrandLogo } from "@/components/layout/BrandLogo";
import Link from "next/link";

type FooterColumn = {
  title: string;
  links: { label: string; href: string }[];
};

const footerColumns: FooterColumn[] = [
  {
    title: "Product",
    links: [
      { label: "Builder", href: "/builder" },
      { label: "Dashboard", href: "/dashboard" },
      { label: "Pricing", href: "#pricing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#" },
      { label: "Contact", href: "#" },
      { label: "Status", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", href: "#" },
      { label: "Privacy", href: "#" },
      { label: "Refunds", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-12 w-full border-t border-border-light bg-inverse text-text-inverse dark:border-border-light/40">
      <div className="mx-auto max-w-[1200px] px-6 py-10 md:px-12">
        <div className="flex flex-col justify-between gap-10 lg:flex-row">
          <div className="flex max-w-[340px] flex-col gap-3">
            <BrandLogo variant="inverse" asLink={false} />
            <p className="text-sm leading-relaxed text-text-tertiary">
              Render Resume is a pay-per-download resume builder for developers
              and technical job seekers.
            </p>
          </div>

          <div className="flex flex-wrap gap-12 md:gap-14">
            {footerColumns.map((column) => (
              <div key={column.title} className="flex flex-col gap-2">
                <span className="font-mono text-xs font-medium uppercase tracking-[0.08em] text-text-tertiary">
                  {column.title}
                </span>
                {column.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    className="text-sm text-text-inverse transition-opacity hover:opacity-80"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-border-strong/80 pt-5 text-xs text-text-tertiary sm:flex-row sm:items-center sm:justify-between dark:border-border-light/30">
          <p>© 2024 Render Resume. All rights reserved.</p>
          <p>Built with LaTeX · Preview free · Pay per download</p>
        </div>
      </div>
    </footer>
  );
}
