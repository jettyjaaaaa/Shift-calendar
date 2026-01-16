"use client";

import dayjs from "dayjs";
import clsx from "clsx";
import { ShiftRow, ShiftPeriod } from "@/lib/types";
import { ShiftChip } from "@/components/ShiftChip";

function startOfGrid(month: dayjs.Dayjs) {
  const start = month.startOf("month");
  const dow = start.day(); // 0=Sun
  return start.subtract(dow, "day");
}

const periodOrder: Record<ShiftPeriod, number> = {
  morning: 0,
  afternoon: 1,
  night: 2,
};

export function CalendarMonth({
  month,
  shiftsByDate,
  onPickDate,
}: {
  month: dayjs.Dayjs;
  shiftsByDate: Record<string, ShiftRow[]>;
  onPickDate: (dateISO: string) => void;
}) {
  const gridStart = startOfGrid(month);
  const days = Array.from({ length: 42 }, (_, i) => gridStart.add(i, "day"));
  const todayISO = dayjs().format("YYYY-MM-DD");

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 gap-2 text-center text-xs text-zinc-500">
        {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((d) => {
          const iso = d.format("YYYY-MM-DD");
          const inMonth = d.month() === month.month();
          const itemsRaw = shiftsByDate[iso] ?? [];

          const items = [...itemsRaw].sort((a, b) => {
            return (periodOrder[a.period] ?? 99) - (periodOrder[b.period] ?? 99);
          });

          return (
            <button
              key={iso}
              onClick={() => onPickDate(iso)}
              className={clsx(
                "min-h-[86px] rounded-2xl p-2 text-left shadow-sm",
                "bg-white active:scale-[0.99] transition",
                inMonth ? "opacity-100" : "opacity-50",
                iso === todayISO && "ring-2 ring-zinc-900"
              )}
              type="button"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">{d.date()}</div>
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-1">
                {items.slice(0, 3).map((s) => (
                  <ShiftChip key={s.id} shift={s} />
                ))}

                {items.length > 3 && (
                  <span className="text-[11px] font-semibold text-zinc-500">
                    +{items.length - 3}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
