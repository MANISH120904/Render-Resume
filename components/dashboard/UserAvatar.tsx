type Props = {
  name: string;
};

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return "?";
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function UserAvatar({ name }: Props) {
  return (
    <span
      className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-surface-secondary text-xs font-semibold text-text-secondary"
      aria-label={`Profile for ${name}`}
    >
      {getInitials(name)}
    </span>
  );
}
