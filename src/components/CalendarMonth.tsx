"use client";

import dayjs from "dayjs";
import clsx from "clsx";
import { ShiftPeriod, ShiftRow } from "@/lib/types";
import { ShiftChip } from "@/components/ShiftChip";

function startOfGrid(month: dayjs.Dayjs) {
  const start = month.startOf("month");
  const dow = start.day();
  return start.subtract(dow, "day");
}

const periodOrder: ShiftPeriod[] = ["morning", "afternoon", "night"];

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
      <div className="grid grid-cols-7 gap-2 text-center text-xs text-zinc-500 dark:text-zinc-400">
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
          const items = shiftsByDate[iso] ?? [];

          const byPeriod = new Map<ShiftPeriod, ShiftRow>();
          for (const it of items) byPeriod.set(it.period, it);

          const hasAll3 = periodOrder.every((p) => byPeriod.has(p));
          const allOff = hasAll3 && periodOrder.every((p) => byPeriod.get(p)?.day_type === "off");
          const allLeave =
            hasAll3 && periodOrder.every((p) => byPeriod.get(p)?.day_type === "leave");

          const isToday = iso === todayISO;

          const bgClass = allOff
            ? "bg-zinc-100 dark:bg-zinc-900/50" //  off
            : allLeave
              ? "bg-violet-100 dark:bg-violet-900/30" //  leave
              : isToday
                ? "bg-yellow-100 dark:bg-yellow-900/25" // today
                : "bg-white dark:bg-zinc-950";

          return (
            <button
              key={iso}
              onClick={() => onPickDate(iso)}
              type="button"
              className={clsx(
                "rounded-2xl shadow-sm transition active:scale-[0.99]",
                "h-[118px] overflow-hidden p-2 pb-3",
                "grid grid-rows-[22px_1fr]",
                inMonth ? "opacity-100" : "opacity-50",
                bgClass
              )}
            >
              <div className="flex items-center justify-start">
                <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {d.date()}
                </div>
              </div>

              <div className="relative">
                {allOff || allLeave ? (
                  <div className="h-full w-full relative">
                    <div
                      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                                 rounded-xl bg-white/60 dark:bg-zinc-950/60
                                 px-3 py-2 text-[12px] font-extrabold text-zinc-900 dark:text-zinc-100"
                    >
                      {allOff ? "หยุด" : "ลา"}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-rows-3 gap-1">
                    {periodOrder.map((p) => {
                      const s = byPeriod.get(p);
                      return (
                        <div key={p} className="h-[26px] w-full">
                          {s ? (
                            <ShiftChip shift={s} />
                          ) : (
                            <div className="h-[26px] w-full bg-transparent" />
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
