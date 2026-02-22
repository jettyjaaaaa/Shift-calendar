import clsx from "clsx";
import type { ShiftPeriod } from "@/lib/types";
import { periodLabel } from "@/lib/colors";
import { periods } from "./constants";

export function Segmented({
  value,
  onChange,
}: {
  value: ShiftPeriod;
  onChange: (v: ShiftPeriod) => void;
}) {
  return (
    <div className="mt-4">
      <div className="mb-2 text-xs font-bold text-zinc-500 dark:text-zinc-400">เลือกช่วงเวร</div>
      <div className="grid grid-cols-3 rounded-2xl bg-zinc-100 p-1 dark:bg-zinc-900">
        {periods.map((p) => (
          <button
            type="button"
            key={p}
            onClick={() => onChange(p)}
            aria-pressed={value === p}
            className={clsx(
              "rounded-xl px-3 py-2.5 text-sm font-bold transition active:scale-[0.98]",
              value === p
                ? "bg-white text-zinc-950 shadow-sm dark:bg-zinc-950 dark:text-white dark:shadow-none"
                : "text-zinc-600 dark:text-zinc-300"
            )}
          >
            {periodLabel[p]}
          </button>
        ))}
      </div>
    </div>
  );
}
