type Props = {
  initials: string;
  size?: number;
  className?: string;
};

export default function InitialsAvatar({ initials, size = 160, className = "" }: Props) {
  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full ${className}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-violet-500 to-indigo-600" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_55%)]" />
      <span
        className="relative font-(family-name:--font-syne) font-bold text-white tracking-tight"
        style={{ fontSize: size * 0.4 }}
      >
        {initials}
      </span>
    </div>
  );
}
