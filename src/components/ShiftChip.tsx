import { colorClasses, periodLabel } from "@/lib/colors";
import { ShiftRow } from "@/lib/types";
import clsx from "clsx";
import { parseShiftNote } from "@/lib/shiftNoteMeta";
import { ExchangeDirectionIcon } from "@/components/ExchangeDirectionIcon";
import { OvertimeIcon } from "@/components/OvertimeIcon";
import { memo } from "react";

export const ShiftChip = memo(function ShiftChip({ shift }: { shift: ShiftRow }) {
  const isSpecial = shift.day_type !== "shift";

  const parsed = parseShiftNote(shift.note);
  const meta = parsed.meta;
  const oncall = !!meta.oncall;
  const bought = !!meta.bought;
  const swapDirection = meta.swap_direction ?? "out";

  const label = isSpecial ? (shift.day_type === "off" ? "หยุด" : "ลา") : periodLabel[shift.period]; // ช/บ/ด

  const tipParts: string[] = [];
  if (parsed.text) tipParts.push(parsed.text);
  if (!isSpecial && shift.swapped && shift.swapped_with) {
    tipParts.push(
      swapDirection === "out"
        ? `ส่งเวรให้: ${shift.swapped_with}`
        : `รับเวรจาก: ${shift.swapped_with}`
    );
  }
  if (!isSpecial && !shift.swapped && bought && meta.bought_from)
    tipParts.push(`ซื้อจาก: ${meta.bought_from}`);
  if (!isSpecial && !shift.swapped && bought && typeof meta.bought_price === "number")
    tipParts.push(`ซื้อ: ${meta.bought_price}`);
  if (!isSpecial && !shift.swapped && shift.sold && shift.sold_to)
    tipParts.push(`ขายให้: ${shift.sold_to}`);
  const title = tipParts.length ? tipParts.join(" • ") : undefined;

  return (
    <div
      className={clsx(
        "flex h-full min-h-0 w-full min-w-0 items-center justify-center gap-[2px] overflow-hidden rounded-[7px] px-0.5 min-[480px]:rounded-lg sm:gap-1 sm:rounded-xl sm:px-1",
        "text-[10px] font-extrabold leading-none min-[480px]:text-[11px] sm:text-[12px]",
        "whitespace-nowrap tabular-nums",
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
      <span className="shrink-0">{label}</span>

      {!isSpecial && shift.is_ot && (
        <OvertimeIcon className="h-3 w-3 shrink-0 min-[480px]:h-3.5 min-[480px]:w-3.5 sm:h-4 sm:w-4" />
      )}

      {!isSpecial && shift.swapped && <ExchangeDirectionIcon direction={swapDirection} compact />}

      {!isSpecial && !shift.swapped && bought && (
        <span className="shrink-0 text-[9px] font-black sm:text-[11px]">+</span>
      )}

      {!isSpecial && !shift.swapped && shift.sold && (
        <span className="shrink-0 text-[9px] font-black sm:text-[11px]">−</span>
      )}
    </div>
  );
});
