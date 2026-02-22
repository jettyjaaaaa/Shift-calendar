export function StatCard({
  title,
  value,
  valueClassName,
  subtitle,
  children,
}: {
  title: string;
  value: React.ReactNode;
  valueClassName?: string;
  subtitle?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="bg-zinc-50 rounded-2xl p-5 dark:bg-zinc-900/50">
      <div className="text-xs text-zinc-500 dark:text-zinc-400">{title}</div>
      <div className={valueClassName ?? "text-3xl font-bold"}>{value}</div>
      {subtitle && (
        <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">{subtitle}</div>
      )}
      {children}
    </div>
  );
}
