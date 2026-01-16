"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import { supabase } from "@/lib/supabaseClient";
import { periodLabel, dayTypeLabel } from "@/lib/colors";

type HistoryRow = {
  id: number;
  action: "INSERT" | "UPDATE" | "DELETE";
  changed_at: string;
  old_row: any;
  new_row: any;
};

function buildSummary(row: HistoryRow) {
  const before = row.old_row;
  const after = row.new_row;

  const base = after ?? before;
  if (!base) return "มีการเปลี่ยนแปลงข้อมูล";

  const period = periodLabel[base.period] ?? "";
  const date = base.work_date;

  let title = "";
  if (row.action === "INSERT") title = `เพิ่มเวร ${period}`;
  if (row.action === "UPDATE") title = `แก้ไขเวร ${period}`;
  if (row.action === "DELETE") title = `ลบเวร ${period}`;

  const details: string[] = [];

  if (after?.day_type && after.day_type !== before?.day_type) {
    details.push(`สถานะ: ${dayTypeLabel[after.day_type]}`);
  }

  if (after?.is_ot !== before?.is_ot) {
    details.push(after.is_ot ? "เพิ่ม OT" : "เอา OT ออก");
  }

  if (after?.swapped !== before?.swapped) {
    details.push(after.swapped ? "สลับเวร" : "ยกเลิกสลับเวร");
  }

  if (after?.swapped_with && after?.swapped_with !== before?.swapped_with) {
    details.push(`สลับกับ: ${after.swapped_with}`);
  }

  if (after?.note && after?.note !== before?.note) {
    details.push(`หมายเหตุ: ${after.note}`);
  }

  return { title, date, details };
}

export default function HistoryPage() {
  const [rows, setRows] = useState<HistoryRow[]>([]);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase
        .from("shift_history_public")
        .select("id, action, changed_at, old_row, new_row")
        .order("changed_at", { ascending: false })
        .limit(200);

      if (error) {
        alert(error.message);
        return;
      }
      setRows((data ?? []) as HistoryRow[]);
    })();
  }, []);

  const items = useMemo(
    () =>
      rows.map((r) => ({
        id: r.id,
        time: dayjs(r.changed_at),
        summary: buildSummary(r),
      })),
    [rows]
  );

  return (
    <main className="mx-auto max-w-[520px] p-4 pb-24">
      <header className="flex items-center justify-between">
        <div className="text-xl font-extrabold">ประวัติการแก้ไข</div>
        <Link
          href="/"
          className="rounded-2xl bg-white px-3 py-2 text-sm font-semibold shadow-sm"
        >
          ← กลับ
        </Link>
      </header>

      <div className="mt-4 space-y-3">
        {items.map(({ id, time, summary }) => {
          if (typeof summary === "string") {
            return (
              <div key={id} className="rounded-3xl bg-white p-4 shadow-sm">
                {summary}
              </div>
            );
          }

          return (
            <div key={id} className="rounded-3xl bg-white p-4 shadow-sm">
              <div className="text-xs text-zinc-500">
                {summary.date} • {time.format("DD MMM YYYY HH:mm")}
              </div>

              <div className="mt-1 font-semibold">{summary.title}</div>

              {summary.details.length > 0 && (
                <ul className="mt-2 space-y-1 text-sm text-zinc-700">
                  {summary.details.map((d, i) => (
                    <li key={i}>• {d}</li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}

        {items.length === 0 && (
          <div className="rounded-3xl bg-white p-6 text-center text-zinc-500 shadow-sm">
            ยังไม่มีประวัติการแก้ไข
          </div>
        )}
      </div>
    </main>
  );
}
