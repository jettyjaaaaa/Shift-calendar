import clsx from "clsx";

export function ExchangeDirectionIcon({
  direction,
  compact = false,
}: {
  direction: "out" | "in";
  compact?: boolean;
}) {
  const outgoing = direction === "out";

  return (
    <span
      className={clsx(
        "inline-grid shrink-0 place-items-center rounded-full border font-black leading-none shadow-sm",
        compact
          ? "h-[15px] w-[15px] text-[11px] min-[480px]:h-4 min-[480px]:w-4 min-[480px]:text-xs"
          : "h-6 w-6 text-sm",
        outgoing
          ? "border-rose-200 bg-white/95 text-rose-600 dark:border-rose-400/80 dark:bg-zinc-950 dark:text-rose-300"
          : "border-sky-200 bg-white/95 text-sky-600 dark:border-sky-400/80 dark:bg-zinc-950 dark:text-sky-300"
      )}
      role="img"
      aria-label={outgoing ? "แลกเวรออก" : "รับเวรเข้า"}
      title={outgoing ? "แลกเวรออก" : "รับเวรเข้า"}
    >
      {outgoing ? "↑" : "↓"}
    </span>
  );
}
