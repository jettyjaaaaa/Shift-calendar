"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { StatCard } from "@/components/summary/StatCard";
import { TradeCard } from "@/components/summary/TradeCard";
import { OncallCard } from "@/components/summary/OncallCard";
import { computeSummaryData, type SummaryShiftRow } from "@/components/summary/summaryData";

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
      .select("id, work_date, period, day_type, sold, sold_to, sold_price, note")
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
    return <div className="min-h-dvh bg-white" />;
  }

  return (
    <div className="min-h-dvh bg-white">
      <div className="max-w-[520px] mx-auto px-4 pt-6 pb-24">
        <div className="flex items-center justify-between">
          <button onClick={prev} className="px-3 py-2 rounded-xl bg-zinc-100">
            ก่อนหน้า
          </button>

          <div className="text-center">
            <div className="text-xs text-zinc-500">หมายเหตุ</div>
            <div className="text-lg font-semibold">{month.format("MMMM YYYY")}</div>
          </div>

          <button onClick={next} className="px-3 py-2 rounded-xl bg-zinc-100">
            ถัดไป
          </button>
        </div>

        <div className="mt-3">
          <Link href="/" className="text-xs text-zinc-400">
            ← กลับ
          </Link>
        </div>

        <div className="mt-6 space-y-4">
          <StatCard
            title="ชั่วโมงขึ้นเวรเดือนนี้"
            value={<div className="text-4xl font-bold">{data.totalHours}</div>}
            subtitle="รวม OT + เวรปกติ (ไม่รวมเวรที่ขาย)"
          />

          <OncallCard rows={data.oncallRows} />

          <StatCard
            title="วันลาพักผ่อนคงเหลือ"
            value={<div className="text-3xl font-bold">{leaveRemain}</div>}
          >
            <div className="mt-2">
              <Link href="/leave" className="text-xs font-semibold text-zinc-600">
                ดูวันที่ลาที่ลาไป →
              </Link>
            </div>
          </StatCard>

          <StatCard
            title="เงินที่เสียจากขายเวร"
            value={`-${data.lostMoney.toLocaleString("th-TH")}`}
            valueClassName="text-3xl font-bold text-red-500"
          />

          <StatCard
            title="เงินที่จ่ายจากซื้อเวร"
            value={`+${data.spentMoney.toLocaleString("th-TH")}`}
            valueClassName="text-3xl font-bold text-emerald-600"
          />

          <TradeCard rows={data.tradedRows} />
        </div>
      </div>
    </div>
  );
}
