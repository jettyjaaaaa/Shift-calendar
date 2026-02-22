"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { StatCard } from "@/components/summary/StatCard";
import { TradeCard } from "@/components/summary/TradeCard";
import { OncallCard } from "@/components/summary/OncallCard";
import { computeSummaryData, type SummaryShiftRow } from "@/components/summary/summaryData";
import { ChevronIcon } from "@/components/ChevronIcon";
import { OvertimeIcon } from "@/components/OvertimeIcon";

export default function SummaryPage() {
  const [month, setMonth] = useState(() => dayjs());
  const [ready, setReady] = useState(false);
  const [rows, setRows] = useState<SummaryShiftRow[]>([]);
  const [leaveRemain, setLeaveRemain] = useState<number>(0);

  useEffect(() => {
    setMonth(dayjs());
    setReady(true);
  }, []);

  const load = useCallback(async () => {
    const start = month.startOf("month").format("YYYY-MM-DD");
    const end = month.endOf("month").format("YYYY-MM-DD");

    const { data } = await supabase
      .from("shifts_public")
      .select("id, work_date, period, day_type, is_ot, sold, sold_to, sold_price, note")
      .gte("work_date", start)
      .lte("work_date", end);

    setRows((data || []) as SummaryShiftRow[]);
  }, [month]);

  const loadLeave = useCallback(async () => {
    const fiscal = month.month() >= 9 ? month.year() + 1 : month.year();

    const { data } = await supabase
      .from("vacation_remaining_public")
      .select("remaining_days")
      .eq("fiscal_year", fiscal)
      .maybeSingle();

    setLeaveRemain(Number(data?.remaining_days || 0));
  }, [month]);

  useEffect(() => {
    if (!ready) return;
    void load();
    void loadLeave();
  }, [load, loadLeave, ready]);

  const data = useMemo(() => computeSummaryData(rows), [rows]);

  const prev = () => setMonth((m) => m.subtract(1, "month"));
  const next = () => setMonth((m) => m.add(1, "month"));

  if (!ready) {
    return <div className="min-h-dvh bg-[#f7f4ed] dark:bg-zinc-950" />;
  }

  return (
    <main className="min-h-dvh bg-[#f7f4ed] text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="pointer-events-none fixed inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.28),transparent_55%)] dark:opacity-20" />
      <div className="relative mx-auto max-w-[560px] px-3 pb-24 pt-3 min-[480px]:px-4 min-[480px]:pt-5">
        <header className="rounded-[24px] border border-white/80 bg-white/80 p-3 shadow-[0_18px_45px_-34px_rgba(39,39,42,0.65)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/75 min-[480px]:p-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="grid h-10 w-10 place-items-center rounded-xl bg-zinc-100 text-xl font-bold text-zinc-700 transition active:scale-95 dark:bg-zinc-800 dark:text-zinc-100"
              aria-label="กลับหน้าปฏิทิน"
            >
              ‹
            </Link>
            <div className="text-center">
              <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-amber-600">
                สรุปตารางเวร
              </div>
              <div className="mt-0.5 text-lg font-black">{month.format("MMMM YYYY")}</div>
            </div>
            <Link
              href="/"
              className="grid h-10 w-10 place-items-center rounded-xl bg-zinc-950 text-sm font-black text-white transition active:scale-95 dark:bg-white dark:text-zinc-950"
              aria-label="เปิดปฏิทิน"
            >
              ▦
            </Link>
          </div>

          <div className="mt-3 grid grid-cols-[44px_1fr_44px] items-center gap-2">
            <button
              type="button"
              onClick={prev}
              className="grid h-10 w-11 place-items-center rounded-xl bg-zinc-100 text-zinc-800 transition active:scale-95 dark:bg-zinc-800 dark:text-zinc-100"
              aria-label="ก่อนหน้า"
              title="ก่อนหน้า"
            >
              <ChevronIcon direction="left" className="h-5 w-5" />
            </button>

            <div className="text-center text-xs font-bold text-zinc-500 dark:text-zinc-400">
              เลื่อนดูเดือนอื่น
            </div>

            <button
              type="button"
              onClick={next}
              className="grid h-10 w-11 place-items-center rounded-xl bg-zinc-100 text-zinc-800 transition active:scale-95 dark:bg-zinc-800 dark:text-zinc-100"
              aria-label="ถัดไป"
              title="ถัดไป"
            >
              <ChevronIcon direction="right" className="h-5 w-5" />
            </button>
          </div>
        </header>

        <div className="mt-3 space-y-3 min-[480px]:mt-4">
          <section className="overflow-hidden rounded-[26px] bg-zinc-950 p-5 text-white shadow-xl shadow-zinc-900/10 dark:border dark:border-white/10 min-[480px]:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-bold text-zinc-400">ชั่วโมงขึ้นเวรเดือนนี้</div>
                <div className="mt-1 flex items-end gap-2">
                  <span className="text-5xl font-black tracking-tight">{data.totalHours}</span>
                  <span className="pb-1.5 text-sm font-bold text-amber-300">ชั่วโมง</span>
                </div>
              </div>
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-400 text-xl text-amber-950">
                ◷
              </div>
            </div>
            <div className="mt-4 text-[11px] text-zinc-400">รวมเวรปกติและ OT · ไม่รวมเวรที่ขาย</div>
          </section>

          <div className="grid grid-cols-2 gap-3">
            <StatCard
              title="เวร OT ทั้งหมด"
              value={
                <div className="flex items-center gap-2 text-3xl font-black">
                  <OvertimeIcon className="h-6 w-6 text-sky-600" />
                  {data.otCount}
                </div>
              }
              subtitle="รวม On-call"
            />
            <StatCard
              title="On-call"
              value={
                <div className="flex items-center gap-2 text-3xl font-black text-rose-600">
                  <span className="h-3 w-3 rounded-full bg-red-500" aria-hidden="true" />
                  {data.oncallCount}
                </div>
              }
              subtitle="OT แต่ไม่ได้ขึ้น"
            />
          </div>

          <StatCard
            title="วันลาพักผ่อนคงเหลือ"
            value={
              <div className="flex items-end gap-2">
                <span className="text-3xl font-black">{leaveRemain}</span>
                <span className="pb-1 text-xs font-bold text-zinc-400">วัน</span>
              </div>
            }
            className="border-amber-100 bg-amber-50/80 dark:border-amber-500/20 dark:bg-amber-500/10"
          >
            <div className="mt-2">
              <Link
                href="/leave"
                className="inline-flex rounded-full bg-white px-3 py-1.5 text-xs font-bold text-amber-800 shadow-sm dark:bg-zinc-900 dark:text-amber-200"
              >
                ดูวันที่ลาที่ลาไป →
              </Link>
            </div>
          </StatCard>

          <section className="rounded-[22px] border border-white/80 bg-white/85 p-4 shadow-[0_16px_40px_-32px_rgba(39,39,42,0.65)] dark:border-white/10 dark:bg-zinc-900/75">
            <div className="mb-3 text-sm font-black">สรุปค่าเวร</div>
            <div className="grid grid-cols-2 divide-x divide-zinc-200 dark:divide-zinc-800">
              <div className="pr-3">
                <div className="text-[11px] font-bold text-zinc-400">ซื้อเวร</div>
                <div className="mt-1 text-xl font-black text-emerald-600">
                  ฿{data.spentMoney.toLocaleString("th-TH")}
                </div>
              </div>
              <div className="pl-3">
                <div className="text-[11px] font-bold text-zinc-400">ขายเวร</div>
                <div className="mt-1 text-xl font-black text-rose-500">
                  ฿{data.lostMoney.toLocaleString("th-TH")}
                </div>
              </div>
            </div>
          </section>

          <OncallCard rows={data.oncallRows} />

          <TradeCard rows={data.tradedRows} />
        </div>
      </div>
    </main>
  );
}
