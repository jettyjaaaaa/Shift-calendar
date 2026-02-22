export function StatCard({
  title,
  value,
  valueClassName,
  subtitle,
  children,
  className,
}: {
  title: string;
  value: React.ReactNode;
  valueClassName?: string;
  subtitle?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-[22px] border border-white/80 bg-white/85 p-4 shadow-[0_16px_40px_-32px_rgba(39,39,42,0.65)] dark:border-white/10 dark:bg-zinc-900/75 ${className ?? ""}`}
    >
      <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400">{title}</div>
      <div className={valueClassName ?? "mt-1 text-3xl font-black"}>{value}</div>
      {subtitle && (
        <div className="mt-1 text-[11px] leading-snug text-zinc-400 dark:text-zinc-500">
          {subtitle}
        </div>
      )}
      {children}
    </div>
  );
}
