"use client";

import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { supabase } from "@/lib/supabaseClient";
import { ShiftRow } from "@/lib/types";
import { CountdownSlots } from "@/components/countdown/CountdownSlots";
import { CalendarMonth } from "@/components/CalendarMonth";

function IconChevronLeft(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      aria-hidden="true"
    >
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

function IconChevronRight(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      aria-hidden="true"
    >
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function IconNote(props: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={props.className}
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8" />
      <path d="M8 17h8" />
    </svg>
  );
}

const EditSheet = dynamic(() => import("@/components/EditSheet").then((m) => m.EditSheet), {
  ssr: false,
  loading: () => null,
});

export default function HomePage() {
  const [month, setMonth] = useState(() => dayjs().startOf("month"));
  const [ready, setReady] = useState(false);
  const [rows, setRows] = useState<ShiftRow[]>([]);
  const [pickedDate, setPickedDate] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    // Ensure we use the device's current date on (re)open.
    // This avoids showing a deploy/build-time date from pre-rendered HTML.
    setMonth(dayjs().startOf("month"));
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;

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
  }, [month, ready, reloadKey]);

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

  if (!ready) {
    return <div className="min-h-dvh bg-zinc-50" />;
  }

  return (
    <div className="min-h-dvh bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="mx-auto max-w-[520px] px-4 pb-24 pt-6">
        <div className="mb-4">
          <CountdownSlots />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={goPrev}
            className="h-10 w-10 rounded-xl bg-white shadow grid place-items-center text-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            aria-label="ก่อนหน้า"
            title="ก่อนหน้า"
          >
            <IconChevronLeft className="h-5 w-5" />
          </button>

          <div className="text-center">
            <div className="text-lg font-semibold">{month.format("MMMM YYYY")}</div>
            {/* <button type="button" onClick={goToday} className="mt-1 text-[11px] text-zinc-500">
              วันนี้
            </button> */}
          </div>

          <button
            type="button"
            onClick={goNext}
            className="h-10 w-10 rounded-xl bg-white shadow grid place-items-center text-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            aria-label="ถัดไป"
            title="ถัดไป"
          >
            <IconChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between gap-3">
          <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
            + ซื้อ,&nbsp;&nbsp;- ขาย,&nbsp;&nbsp;● OT,&nbsp;&nbsp;แดง oncall
          </div>
          <Link
            href="/summary"
            className="h-10 w-10 rounded-xl bg-black text-white grid place-items-center dark:bg-zinc-100 dark:text-zinc-900"
            aria-label="หมายเหตุ"
            title="หมายเหตุ"
          >
            <IconNote className="h-5 w-5" />
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
