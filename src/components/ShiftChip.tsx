import { colorClasses, periodLabel } from "@/lib/colors";
import { ShiftRow } from "@/lib/types";
import clsx from "clsx";

export function ShiftChip({ shift }: { shift: ShiftRow }) {
  const isSpecial = shift.day_type !== "shift";

  const label = isSpecial
    ? shift.day_type === "off"
      ? "หยุด"
      : "ลา"
    : periodLabel[shift.period]; // ช/บ/ด

  return (
    <div
      className={clsx(
        // ✅ เต็มแถว + สูงเท่ากัน + อยู่กลาง
        "h-[26px] w-full rounded-xl flex items-center justify-center gap-1",
        "text-[12px] font-extrabold leading-none",
        "whitespace-nowrap",
        isSpecial
          ? "bg-zinc-200 text-zinc-800"
          : shift.color
            ? colorClasses[shift.color]
            : "bg-zinc-200 text-zinc-900"
      )}
      title={shift.note ?? undefined}
    >
      <span>{label}</span>

      {/* OT = จุดดำ */}
      {!isSpecial && shift.is_ot && <span className="text-[10px] text-black">●</span>}

      {/* สลับเวร = ↔ */}
      {!isSpecial && shift.swapped && <span className="text-[10px] opacity-90">↔</span>}
    </div>
  );
}
