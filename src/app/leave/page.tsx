"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type LeaveDayRow = {
  id: number;
  work_date: string;
  note: string | null;
};

export default function LeaveListPage() {
  const [rows, setRows] = useState<LeaveDayRow[]>([]);

  const load = useCallback(async () => {
    const { data, error } = await supabase
      .from("shifts_public")
      .select("id, work_date, note")
      .eq("day_type", "leave")
      .eq("leave_kind", "vacation")
      .order("work_date", { ascending: true });

    if (error) {
      console.error(error);
      return;
    }

    setRows((data ?? []) as LeaveDayRow[]);
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const uniqueDays = useMemo(() => {
    const byDate = new Map<string, LeaveDayRow>();
    for (const r of rows) {
      if (!byDate.has(r.work_date)) byDate.set(r.work_date, r);
    }
    return Array.from(byDate.values()).sort((a, b) => a.work_date.localeCompare(b.work_date));
  }, [rows]);

  const byMonth = useMemo(() => {
    const groups = new Map<string, { label: string; items: LeaveDayRow[] }>();
    for (const r of uniqueDays) {
      const d = dayjs(r.work_date);
      const key = d.format("YYYY-MM");
      const label = d.format("MMMM YYYY");
      if (!groups.has(key)) groups.set(key, { label, items: [] });
      groups.get(key)!.items.push(r);
    }
    return Array.from(groups.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([, v]) => v);
  }, [uniqueDays]);

  return (
    <div className="min-h-dvh bg-white">
      <div className="max-w-[520px] mx-auto px-4 pt-6 pb-32">
        <Link href="/summary" className="text-xs text-zinc-500">
          ← กลับ summary
        </Link>

        <h1 className="text-xl font-bold mt-3">วันลาพักผ่อนทั้งหมด</h1>

        {byMonth.length === 0 ? (
          <div className="text-zinc-400 mt-4">ยังไม่มีวันลา</div>
        ) : (
          <div className="mt-4 space-y-6">
            {byMonth.map((g) => (
              <section key={g.label}>
                <div className="text-xs font-bold text-zinc-500">{g.label}</div>
                <div className="mt-2 space-y-2">
                  {g.items.map((r) => (
                    <div key={r.id} className="bg-white border rounded-xl p-3 shadow-sm">
                      <div className="font-semibold">{dayjs(r.work_date).format("DD/MM/YYYY")}</div>
                      {r.note && <div className="text-xs text-zinc-500 mt-1">{r.note}</div>}
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
