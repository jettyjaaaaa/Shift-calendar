import dayjs from "dayjs";
import { periodLabel } from "@/lib/colors";
import type { SummaryShiftRow } from "./summaryData";

export function OncallCard({ rows }: { rows: SummaryShiftRow[] }) {
  return (
    <div className="bg-zinc-50 rounded-2xl p-5 dark:bg-zinc-900/50">
      <div className="text-xs text-zinc-500 dark:text-zinc-400">เวร oncall เดือนนี้</div>
      <div className="text-4xl font-bold text-red-600">{rows.length}</div>
      <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">OT แต่ไม่ได้ขึ้น</div>

      {rows.length === 0 ? (
        <div className="text-xs text-zinc-400 dark:text-zinc-500 mt-3">ไม่มี</div>
      ) : (
        <div className="mt-3 space-y-2">
          {rows.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-xl px-3 py-2 border border-zinc-200 flex justify-between dark:bg-zinc-950 dark:border-zinc-800"
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
  );
}
