import { colorClasses, periodLabel } from "@/lib/colors";
import { ShiftRow } from "@/lib/types";
import clsx from "clsx";

export function ShiftChip({ shift }: { shift: ShiftRow }) {
  const isSpecial = shift.day_type !== "shift";

  // ✅ ทำให้ชิปสั้นและเท่ากัน
  const label = isSpecial
    ? shift.day_type === "off"
      ? "หย"
      : "ลา"
    : periodLabel[shift.period]; // ช / บ / ด

  return (
    <div
      className={clsx(
        // ✅ กำหนดขนาดคงที่ + จัดกลาง
        "inline-flex h-7 w-[56px] items-center justify-center gap-1 rounded-full px-2 text-[12px] font-semibold",
        "whitespace-nowrap",
        isSpecial
          ? "bg-zinc-200 text-zinc-900"
          : shift.color
            ? colorClasses[shift.color]
            : "bg-zinc-200 text-zinc-900"
      )}
      title={shift.note ?? undefined}
    >
      <span>{label}</span>

      {/* OT = จุดดำ */}
      {!isSpecial && shift.is_ot && (
        <span className="text-[10px] leading-none text-black">●</span>
      )}

      {/* สลับเวร = ↔ */}
      {!isSpecial && shift.swapped && (
        <span className="text-[10px] leading-none opacity-90">↔</span>
      )}
    </div>
  );
}
