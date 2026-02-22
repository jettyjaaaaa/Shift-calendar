"use client";

import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { CountdownSlots } from "@/components/countdown/CountdownSlots";
import { CalendarMonth } from "@/components/CalendarMonth";
import { CalendarHeader } from "@/components/CalendarHeader";
import { CalendarLegend } from "@/components/CalendarLegend";
import { useMonthlyShifts } from "@/hooks/useMonthlyShifts";
import type { ShiftRow } from "@/lib/types";

const EditSheet = dynamic(() => import("@/components/EditSheet").then((m) => m.EditSheet), {
  ssr: false,
  loading: () => null,
});

export default function HomePage() {
  const [month, setMonth] = useState(() => dayjs().startOf("month"));
  const [ready, setReady] = useState(false);
  const [pickedDate, setPickedDate] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // Ensure we use the device's current date on (re)open.
    // This avoids showing a deploy/build-time date from pre-rendered HTML.
    setMonth(dayjs().startOf("month"));
    setReady(true);
  }, []);

  const { rows, loading, error } = useMonthlyShifts({
    month,
    enabled: ready,
    refreshKey: reloadKey,
  });

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

  const handleSaved = () => {
    setReloadKey((k) => k + 1);
  };

  const goPrev = () => setMonth((m) => m.subtract(1, "month"));
  const goNext = () => setMonth((m) => m.add(1, "month"));
  const goToday = () => setMonth(dayjs().startOf("month"));

  if (!ready) {
    return <div className="min-h-dvh bg-[#fff8df] dark:bg-zinc-950" />;
  }

  return (
    <main className="min-h-dvh overflow-hidden bg-[#fff8df] text-zinc-950 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_top_left,rgba(251,191,36,0.34),transparent_56%),radial-gradient(circle_at_top_right,rgba(249,115,22,0.14),transparent_48%)] dark:opacity-20" />
      <div className="relative mx-auto max-w-[720px] px-2 pb-16 pt-2 min-[480px]:px-3 min-[480px]:pt-4 sm:px-5 sm:pb-24 sm:pt-6">
        <CalendarHeader month={month} onPrevious={goPrev} onNext={goNext} onToday={goToday} />

        <section className="mt-3 rounded-[22px] border border-amber-100/90 bg-white/75 p-2.5 shadow-[0_18px_45px_-32px_rgba(120,53,15,0.4)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/60 min-[480px]:mt-4 min-[480px]:rounded-[28px] min-[480px]:p-3 sm:p-4">
          <CountdownSlots />
        </section>

        <section className="mt-3 rounded-[22px] border border-amber-100/90 bg-white/85 p-2 shadow-[0_18px_45px_-30px_rgba(120,53,15,0.38)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/75 min-[480px]:mt-4 min-[480px]:rounded-[28px] min-[480px]:p-3 sm:p-4">
          <div className="mb-2 flex items-start justify-between gap-2 min-[480px]:mb-3 min-[480px]:gap-3">
            <div>
              <h2 className="text-sm font-black min-[480px]:text-base">
                เลือกวันที่เพื่อจัดการเวร
              </h2>
              <p className="mt-0.5 text-[10px] text-zinc-500 dark:text-zinc-400 min-[480px]:text-xs">
                แตะวันที่เพื่อดูหรือแก้ไขรายละเอียด
              </p>
            </div>
            {loading ? <span className="status-pill">กำลังโหลด…</span> : null}
            {error ? <span className="status-pill text-rose-600">โหลดไม่สำเร็จ</span> : null}
          </div>
          <CalendarLegend />
          <div className="mt-1.5 min-[480px]:mt-3">
            <CalendarMonth month={month} shiftsByDate={shiftsByDate} onPickDate={pickDate} />
          </div>
        </section>
      </div>

      <EditSheet
        open={sheetOpen}
        dateISO={pickedDate}
        shifts={shiftsForPickedDate}
        onClose={() => setSheetOpen(false)}
        onSaved={handleSaved}
      />
    </main>
  );
}
