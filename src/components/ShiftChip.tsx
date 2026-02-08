import { colorClasses, periodLabel } from "@/lib/colors";
import { ShiftRow } from "@/lib/types";
import clsx from "clsx";

export function ShiftChip({ shift }: { shift: ShiftRow }) {
  const isSpecial = shift.day_type !== "shift";

  const label = isSpecial ? (shift.day_type === "off" ? "หยุด" : "ลา") : periodLabel[shift.period]; // ช/บ/ด

  const tipParts: string[] = [];
  if (shift.note) tipParts.push(shift.note);
  if (!isSpecial && shift.sold && shift.sold_to) tipParts.push(`ขายให้: ${shift.sold_to}`);
  const title = tipParts.length ? tipParts.join(" • ") : undefined;

  return (
    <div
      className={clsx(
        "h-[26px] w-full rounded-xl flex items-center justify-center gap-1",
        "text-[12px] font-extrabold leading-none",
        "whitespace-nowrap",
        isSpecial
          ? "bg-zinc-200 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-100"
          : shift.color
            ? colorClasses[shift.color]
            : "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
      )}
      title={title}
    >
      <span>{label}</span>

      {!isSpecial && shift.is_ot && (
        <span className="text-[10px] text-black dark:text-zinc-100">●</span>
      )}

      {!isSpecial && shift.swapped && <span className="text-[10px] opacity-90">↔</span>}

      {/* sold marker (กันกรณีไม่ได้เลือกแดง) */}
      {!isSpecial && shift.sold && (
        <span className="text-[10px] text-red-600 dark:text-red-400">•</span>
      )}
    </div>
  );
}
