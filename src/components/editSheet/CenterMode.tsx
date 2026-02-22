import clsx from "clsx";
import type { DayType } from "@/lib/types";

export function CenterMode({
  value,
  onChange,
}: {
  value: DayType;
  onChange: (v: DayType) => void;
}) {
  const btn = (v: DayType, label: string) => (
    <button
      type="button"
      onClick={() => onChange(v)}
      className={clsx(
        "flex-1 rounded-2xl px-4 py-3 text-sm font-extrabold transition",
        value === v
          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
          : "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
      )}
    >
      {label}{" "}
    </button>
  );

  return (
    <div className="flex gap-2 mt-3">
      {btn("shift", "ทำงาน")}
      {btn("off", "หยุด")}
      {btn("leave", "ลา")}{" "}
    </div>
  );
}
