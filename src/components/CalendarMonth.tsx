"use client";

import dayjs from "dayjs";
import clsx from "clsx";
import { ShiftPeriod, ShiftRow } from "@/lib/types";
import { ShiftChip } from "@/components/ShiftChip";
import { useMemo } from "react";

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
  showWeekdays = true,
}: {
  month: dayjs.Dayjs;
  shiftsByDate: Record<string, ShiftRow[]>;
  onPickDate: (dateISO: string) => void;
  showWeekdays?: boolean;
}) {
  const days = useMemo(() => {
    const gridStart = startOfGrid(month);
    return Array.from({ length: 42 }, (_, i) => gridStart.add(i, "day"));
  }, [month]);
  const todayISO = dayjs().format("YYYY-MM-DD");

  return (
    <div className="w-full">
      {showWeekdays ? (
        <div className="grid grid-cols-7 gap-[3px] text-center text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 min-[480px]:gap-1 min-[480px]:text-[11px] sm:gap-2">
          {["อา", "จ", "อ", "พ", "พฤ", "ศ", "ส"].map((d) => (
            <div key={d} className="py-1">
              {d}
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid grid-cols-7 gap-[3px] min-[480px]:gap-1 sm:gap-2">
        {days.map((d) => {
          const iso = d.format("YYYY-MM-DD");
          const inMonth = d.month() === month.month();
          const items = inMonth ? (shiftsByDate[iso] ?? []) : [];

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
              : "bg-white dark:bg-zinc-950";

          return (
            <button
              key={iso}
              data-iso={iso}
              onClick={() => onPickDate(iso)}
              type="button"
              aria-label={`${d.format("DD/MM/YYYY")}${items.length ? ` มี ${items.length} เวร` : " ไม่มีเวร"}`}
              className={clsx(
                "min-w-0 rounded-xl border border-zinc-100/80 shadow-[0_6px_18px_-16px_rgba(15,23,42,0.7)] transition hover:border-zinc-300 active:scale-[0.97] dark:border-white/5 dark:hover:border-zinc-600 min-[480px]:rounded-[14px] sm:rounded-2xl",
                "h-[94px] overflow-hidden px-[3px] py-1 min-[480px]:h-[104px] min-[480px]:px-1 min-[480px]:py-1.5 sm:h-[118px] sm:p-2 sm:pb-3",
                "grid grid-rows-[18px_1fr] min-[480px]:grid-rows-[21px_1fr] sm:grid-rows-[22px_1fr]",
                inMonth ? "opacity-100" : "opacity-35 grayscale",
                isToday ? "ring-2 ring-inset ring-zinc-700 dark:ring-zinc-300" : "ring-0",
                bgClass
              )}
            >
              <div className="flex items-center justify-start">
                <div className="grid h-[18px] min-w-[18px] place-items-center text-[11px] font-extrabold text-zinc-900 dark:text-zinc-100 min-[480px]:h-5 min-[480px]:min-w-5 min-[480px]:text-xs sm:h-6 sm:min-w-6">
                  {d.date()}
                </div>
              </div>

              <div className="relative min-h-0">
                {allOff || allLeave ? (
                  <div className="h-full w-full relative">
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-lg bg-white/70 px-1.5 py-1 text-[10px] font-extrabold text-zinc-900 dark:bg-zinc-950/60 dark:text-zinc-100 min-[480px]:rounded-xl min-[480px]:px-2 min-[480px]:text-[11px] sm:px-3 sm:py-2 sm:text-[12px]">
                      {allOff ? "หยุด" : "ลา"}
                    </div>
                  </div>
                ) : (
                  <div className="grid h-full min-h-0 grid-rows-3 gap-[2px] min-[480px]:gap-[3px] sm:gap-1">
                    {periodOrder.map((p) => {
                      const s = byPeriod.get(p);
                      return (
                        <div key={p} className="min-h-0 min-w-0 w-full">
                          {s ? (
                            <ShiftChip shift={s} />
                          ) : (
                            <div className="h-full w-full bg-transparent" />
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
