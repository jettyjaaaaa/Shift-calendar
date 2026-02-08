"use client";

import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabaseClient";
import { ShiftRow } from "@/lib/types";
import { CalendarMonth } from "@/components/CalendarMonth";

const EditSheet = dynamic(() => import("@/components/EditSheet").then((m) => m.EditSheet), {
  ssr: false,
  loading: () => null,
});

export default function HomePage() {
  const [month, setMonth] = useState(dayjs().startOf("month"));
  const [rows, setRows] = useState<ShiftRow[]>([]);
  const [pickedDate, setPickedDate] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const start = month.startOf("month").format("YYYY-MM-DD");
      const end = month.endOf("month").format("YYYY-MM-DD");

      const { data, error } = await supabase
        .from("shifts_public")
        .select("*")
        .gte("work_date", start)
        .lte("work_date", end)
        .order("work_date", { ascending: true });

      if (cancelled) return;

      if (error) {
        console.error(error);
        setRows([]);
        return;
      }

      setRows((data ?? []) as ShiftRow[]);
    })();

    return () => {
      cancelled = true;
    };
  }, [month, reloadKey]);

  const shiftsByDate = useMemo(() => {
    const map: Record<string, ShiftRow[]> = {};
    rows.forEach((r) => {
      if (!map[r.work_date]) map[r.work_date] = [];
      map[r.work_date].push(r);
    });
    return map;
  }, [rows]);

  const shiftsForPickedDate = useMemo(() => {
    if (!pickedDate) return [];
    return shiftsByDate[pickedDate] ?? [];
  }, [pickedDate, shiftsByDate]);

  const pickDate = (iso: string) => {
    setPickedDate(iso);
    setSheetOpen(true);
  };

  const goPrev = () => setMonth((m) => m.subtract(1, "month"));
  const goNext = () => setMonth((m) => m.add(1, "month"));

  const handleSaved = () => {
    setReloadKey((k) => k + 1);
  };

  return (
    <div className="min-h-dvh bg-zinc-50">
      <div className="mx-auto max-w-[520px] px-4 pb-24 pt-6">
        <div className="flex items-center justify-between">
          <button onClick={goPrev} className="text-sm px-3 py-2 rounded-xl bg-white shadow">
            ก่อนหน้า
          </button>

          <div className="text-center">
            <div className="text-xs text-zinc-500">ตารางเวร</div>
            <div className="text-lg font-semibold">{month.format("MMMM YYYY")}</div>
          </div>

          <button onClick={goNext} className="text-sm px-3 py-2 rounded-xl bg-white shadow">
            ถัดไป
          </button>
        </div>

        <div className="mt-3 flex justify-end">
          <Link href="/summary" className="text-xs px-3 py-2 rounded-xl bg-black text-white">
            summary
          </Link>
        </div>

        <div className="mt-4">
          <CalendarMonth month={month} shiftsByDate={shiftsByDate} onPickDate={pickDate} />
        </div>
      </div>

      <EditSheet
        open={sheetOpen}
        dateISO={pickedDate}
        shifts={shiftsForPickedDate}
        onClose={() => setSheetOpen(false)}
        onSaved={handleSaved}
      />
    </div>
  );
}
