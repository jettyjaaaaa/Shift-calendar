import { colorClasses, periodLabel } from "@/lib/colors";
import { ShiftRow } from "@/lib/types";
import clsx from "clsx";
import { parseShiftNote } from "@/lib/shiftNoteMeta";

export function ShiftChip({ shift }: { shift: ShiftRow }) {
  const isSpecial = shift.day_type !== "shift";

  const parsed = parseShiftNote(shift.note);
  const meta = parsed.meta;
  const oncall = !!meta.oncall;
  const bought = !!meta.bought;

  const label = isSpecial ? (shift.day_type === "off" ? "หยุด" : "ลา") : periodLabel[shift.period]; // ช/บ/ด

  const tipParts: string[] = [];
  if (parsed.text) tipParts.push(parsed.text);
  if (!isSpecial && shift.swapped && shift.swapped_with) tipParts.push(`สลับกับ: ${shift.swapped_with}`);
  if (!isSpecial && meta.swap_remark) tipParts.push(`remark: ${meta.swap_remark}`);
  if (!isSpecial && bought && meta.bought_from) tipParts.push(`ซื้อจาก: ${meta.bought_from}`);
  if (!isSpecial && bought && typeof meta.bought_price === "number") tipParts.push(`ซื้อ: ${meta.bought_price}`);
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
          : oncall
            ? colorClasses.red
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

      {!isSpecial && bought && <span className="text-[12px] font-black">+</span>}

      {!isSpecial && shift.sold && <span className="text-[12px] font-black">-</span>}
    </div>
  );
}
