"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import type { DayType, ShiftPeriod } from "@/lib/types";
import { periodLabel } from "@/lib/colors";
import { parseShiftNote } from "@/lib/shiftNoteMeta";

const HOUR_PER_SHIFT = 8;

type SummaryShiftRow = {
  id: number;
  work_date: string;
  period: ShiftPeriod;
  day_type: DayType;
  sold: boolean;
  sold_to: string | null;
  sold_price: number | null;
  note: string | null;
};

export default function SummaryPage() {
  const [month, setMonth] = useState(() => dayjs());
  const [rows, setRows] = useState<SummaryShiftRow[]>([]);
  const [leaveRemain, setLeaveRemain] = useState<number>(0);

  // Fix stale SSR/SSG snapshot month (e.g. PWA cached HTML).
  useEffect(() => {
    setMonth(dayjs());
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
    void load();
    void loadLeave();
  }, [load, loadLeave]);

  const data = useMemo(() => {
    const periodRank: Record<string, number> = {
      morning: 0,
      afternoon: 1,
      night: 2,
    };

    const oncallRows = rows
      .filter((r) => r.day_type === "shift")
      .filter((r) => !!parseShiftNote(r.note).meta.oncall)
      .slice()
      .sort((a, b) => {
        const d = a.work_date.localeCompare(b.work_date);
        if (d !== 0) return d;
        return (periodRank[a.period] ?? 99) - (periodRank[b.period] ?? 99);
      });

    const worked = rows.filter((r) => {
      if (r.day_type !== "shift") return false;
      if (r.sold) return false;
      const meta = parseShiftNote(r.note).meta;
      return !meta.oncall;
    });
    const totalHours = worked.length * HOUR_PER_SHIFT;

    const soldRows = rows.filter((r) => r.sold);
    const boughtRows = rows.filter((r) => parseShiftNote(r.note).meta.bought);

    const tradedRows = rows
      .filter((r) => r.sold || parseShiftNote(r.note).meta.bought)
      .slice()
      .sort((a, b) => {
        const d = a.work_date.localeCompare(b.work_date);
        if (d !== 0) return d;
        return (periodRank[a.period] ?? 99) - (periodRank[b.period] ?? 99);
      });

    const lostMoney = soldRows.reduce((sum, r) => sum + (r.sold_price ?? 1200), 0);
    const spentMoney = boughtRows.reduce((sum, r) => {
      const meta = parseShiftNote(r.note).meta;
      return sum + (meta.bought_price ?? 1200);
    }, 0);

    return {
      totalHours,
      tradedRows,
      lostMoney,
      spentMoney,
      oncallRows,
    };
  }, [rows]);

  const prev = () => setMonth((m) => m.subtract(1, "month"));
  const next = () => setMonth((m) => m.add(1, "month"));

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
          <div className="bg-zinc-50 rounded-2xl p-5">
            <div className="text-xs text-zinc-500">ชั่วโมงขึ้นเวรเดือนนี้</div>
            <div className="text-4xl font-bold">{data.totalHours}</div>
            <div className="text-xs text-zinc-400 mt-1">รวม OT + เวรปกติ (ไม่รวมเวรที่ขาย)</div>
          </div>

          <div className="bg-zinc-50 rounded-2xl p-5">
            <div className="text-xs text-zinc-500">เวร oncall เดือนนี้</div>
            <div className="text-4xl font-bold text-red-600">{data.oncallRows.length}</div>
            <div className="text-xs text-zinc-400 mt-1">OT แต่ไม่ได้ขึ้น</div>

            {data.oncallRows.length === 0 ? (
              <div className="text-xs text-zinc-400 mt-3">ไม่มี</div>
            ) : (
              <div className="mt-3 space-y-2">
                {data.oncallRows.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white rounded-xl px-3 py-2 border flex justify-between"
                  >
                    <div className="text-sm">
                      {dayjs(r.work_date).format("DD/MM/YYYY")} • {periodLabel[r.period]}
                    </div>
                    <div className="text-xs font-bold text-red-600">oncall</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-zinc-50 rounded-2xl p-5">
            <div className="text-xs text-zinc-500">วันลาพักผ่อนคงเหลือ</div>
            <div className="text-3xl font-bold">{leaveRemain}</div>
            <div className="mt-2">
              <Link href="/leave" className="text-xs font-semibold text-zinc-600">
                ดูวันที่ลาที่ลาไป →
              </Link>
            </div>
          </div>

          <div className="bg-zinc-50 rounded-2xl p-5">
            <div className="text-xs text-zinc-500">เงินที่เสียจากขายเวร</div>
            <div className="text-3xl font-bold text-red-500">
              -{data.lostMoney.toLocaleString("th-TH")}
            </div>
          </div>

          <div className="bg-zinc-50 rounded-2xl p-5">
            <div className="text-xs text-zinc-500">เงินที่จ่ายจากซื้อเวร</div>
            <div className="text-3xl font-bold text-emerald-600">
              +{data.spentMoney.toLocaleString("th-TH")}
            </div>
          </div>

          <div className="bg-zinc-50 rounded-2xl p-5">
            <div className="text-sm font-bold mb-2">เวรที่ซื้อ/ขายเดือนนี้</div>

            {data.tradedRows.length === 0 && <div className="text-xs text-zinc-400">ไม่มี</div>}

            <div className="space-y-2">
              {data.tradedRows.map((r) => {
                const meta = parseShiftNote(r.note).meta;
                const isBought = !!meta.bought;
                const price = isBought ? (meta.bought_price ?? 1200) : (r.sold_price ?? 1200);

                return (
                  <div
                    key={r.id}
                    className="bg-white rounded-xl px-3 py-2 border flex justify-between"
                  >
                    <div>
                      <div className="text-sm">
                        {dayjs(r.work_date).format("DD/MM/YYYY")} • {periodLabel[r.period]}{" "}
                        <span className={isBought ? "text-emerald-700" : "text-red-600"}>
                          {isBought ? "+" : "-"}
                        </span>
                      </div>
                      <div className="text-xs text-zinc-500">
                        {isBought ? `ซื้อจาก ${meta.bought_from || "-"}` : `ขายให้ ${r.sold_to || "-"}`}
                      </div>
                    </div>

                    <div className={isBought ? "text-sm text-emerald-700 font-semibold" : "text-sm text-red-500 font-semibold"}>
                      {price}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
