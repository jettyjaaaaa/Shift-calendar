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
    <div className="grid grid-cols-3 rounded-2xl bg-zinc-100 p-1 mt-3">
      {periods.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={clsx(
            "rounded-xl px-3 py-2 text-sm font-semibold transition",
            value === p ? "bg-white shadow-sm" : "text-zinc-600"
          )}
        >
          {periodLabel[p]}{" "}
        </button>
      ))}{" "}
    </div>
  );
}
