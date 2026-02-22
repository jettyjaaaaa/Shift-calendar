import { ExchangeDirectionIcon } from "@/components/ExchangeDirectionIcon";
import { OvertimeIcon } from "@/components/OvertimeIcon";

export function CalendarLegend() {
  return (
    <div className="hide-scrollbar -mx-1 flex snap-x flex-nowrap items-center gap-1.5 overflow-x-auto px-1 pb-1 text-[10px] font-bold text-zinc-600 dark:text-zinc-300 min-[480px]:text-[11px]">
      <span className="legend-pill">
        <ExchangeDirectionIcon direction="out" compact /> แลกออก
      </span>
      <span className="legend-pill">
        <ExchangeDirectionIcon direction="in" compact /> แลกเข้า
      </span>
      <span className="legend-pill">
        <b className="text-emerald-600">+</b> ซื้อ
      </span>
      <span className="legend-pill">
        <b className="text-rose-500">−</b> ขาย
      </span>
      <span className="legend-pill">
        <OvertimeIcon className="h-3.5 w-3.5" /> OT
      </span>
      <span className="legend-pill">
        <i className="h-2.5 w-2.5 rounded-full bg-red-500" /> on-call
      </span>
    </div>
  );
}
