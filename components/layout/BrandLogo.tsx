import Link from "next/link";

type BrandLogoProps = {
  variant?: "light" | "inverse";
  className?: string;
  asLink?: boolean;
};

export function BrandLogo({
  variant = "light",
  className = "",
  asLink = true,
}: BrandLogoProps) {
  const content = (
    <>
      <span
        className={`font-mono text-2xl font-semibold leading-none ${
          variant === "inverse" ? "text-text-inverse" : "text-primary"
        }`}
      >
        {"{ }"}
      </span>
      <span
        className={`text-lg font-bold ${
          variant === "inverse" ? "text-text-inverse" : "text-text-primary"
        }`}
      >
        Render Resume
      </span>
    </>
  );

  const wrapperClass = `flex items-center gap-2 ${className}`;

  if (!asLink) {
    return <div className={wrapperClass}>{content}</div>;
  }

  return (
    <Link href="/" className={wrapperClass} aria-label="Render Resume home">
      {content}
    </Link>
  );
}
