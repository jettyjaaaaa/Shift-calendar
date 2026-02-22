"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import type { LeaveDayRow } from "@/components/leave/leaveData";
import { groupLeaveDays } from "@/components/leave/leaveData";
import { LeaveMonthSection } from "@/components/leave/LeaveMonthSection";
import { ChevronIcon } from "@/components/ChevronIcon";

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

  const byMonth = useMemo(() => groupLeaveDays(rows), [rows]);

  return (
    <div className="min-h-dvh bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <div className="max-w-[520px] mx-auto px-4 pt-6 pb-32">
        <div>
          <Link
            href="/summary"
            className="h-10 w-10 rounded-xl bg-zinc-100 grid place-items-center text-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            aria-label="กลับหมายเหตุ"
            title="กลับหมายเหตุ"
          >
            <ChevronIcon direction="left" className="h-5 w-5" />
          </Link>
        </div>

        <h1 className="text-xl font-bold mt-3">วันลาพักผ่อนทั้งหมด</h1>

        {byMonth.length === 0 ? (
          <div className="text-zinc-400 dark:text-zinc-500 mt-4">ยังไม่มีวันลา</div>
        ) : (
          <div className="mt-4 space-y-6">
            {byMonth.map((g) => (
              <LeaveMonthSection key={g.key} group={g} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
