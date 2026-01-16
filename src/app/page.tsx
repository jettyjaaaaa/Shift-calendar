"use client";

import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { ShiftRow } from "@/lib/types";
import { CalendarMonth } from "@/components/CalendarMonth";
import { EditSheet } from "@/components/EditSheet";
import Link from "next/link";

export default function HomePage() {
  const [month, setMonth] = useState(dayjs().startOf("month"));
  const [rows, setRows] = useState<ShiftRow[]>([]);
  const [pickedDate, setPickedDate] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const loadMonth = async () => {
    const start = month.startOf("month").subtract(7, "day").format("YYYY-MM-DD");
    const end = month.endOf("month").add(7, "day").format("YYYY-MM-DD");

    const { data, error } = await supabase
      .from("shifts_public")
      .select("*")
      .gte("work_date", start)
      .lte("work_date", end)
      .order("work_date", { ascending: true });

    if (error) {
      alert(error.message);
      return;
    }
    setRows((data ?? []) as ShiftRow[]);
  };

  useEffect(() => {
    loadMonth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  const shiftsByDate = useMemo(() => {
    const m: Record<string, ShiftRow[]> = {};
    for (const r of rows) (m[r.work_date] ||= []).push(r);
    return m;
  }, [rows]);

  const pickedShifts = useMemo(
    () => (pickedDate ? shiftsByDate[pickedDate] ?? [] : []),
    [pickedDate, shiftsByDate]
  );

  return (
    <main className="mx-auto max-w-[520px] p-3 sm:p-4">
      <header className="sticky top-0 z-10 bg-zinc-50/80 backdrop-blur rounded-3xl p-3">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setMonth((m) => m.subtract(1, "month"))}
            className="rounded-2xl bg-white px-3 py-2 font-semibold shadow-sm"
          >
            ←
          </button>

          <div className="text-base font-extrabold">{month.format("MMMM YYYY")}</div>

          <button
            onClick={() => setMonth((m) => m.add(1, "month"))}
            className="rounded-2xl bg-white px-3 py-2 font-semibold shadow-sm"
          >
            →
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between text-sm">
          <Link className="text-zinc-700 underline" href="/history">
            ประวัติการแก้ไข
          </Link>

          <button
              onClick={loadMonth}
              className="h-10 w-10 rounded-2xl bg-white font-bold shadow-sm grid place-items-center active:scale-[0.98]"
              aria-label="refresh"
              title="Refresh"
            >
              ↻
          </button>

        </div>
      </header>

      <div className="mt-3 pb-24">
        <CalendarMonth
          month={month}
          shiftsByDate={shiftsByDate}
          onPickDate={(iso) => {
            setPickedDate(iso);
            setSheetOpen(true);
          }}
        />
      </div>

      <EditSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        dateISO={pickedDate}
        shifts={pickedShifts}
        onSaved={loadMonth}
      />
    </main>
  );
}
