import dayjs from "dayjs";
import { periodLabel } from "@/lib/colors";
import type { SummaryShiftRow } from "./summaryData";

export function OncallCard({ rows }: { rows: SummaryShiftRow[] }) {
  return (
    <section className="rounded-[22px] border border-white/80 bg-white/85 p-4 shadow-[0_16px_40px_-32px_rgba(39,39,42,0.65)] dark:border-white/10 dark:bg-zinc-900/75">
      <div className="flex items-center gap-2 text-sm font-black text-zinc-800 dark:text-zinc-100">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-500" aria-hidden="true" />
        วันที่ On-call เดือนนี้
      </div>

      {rows.length === 0 ? (
        <div className="mt-3 rounded-xl bg-zinc-50 px-3 py-4 text-center text-xs text-zinc-400 dark:bg-zinc-950/50 dark:text-zinc-500">
          ไม่มีรายการ On-call
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {rows.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div className="text-sm">
                {dayjs(r.work_date).format("DD/MM/YYYY")} • {periodLabel[r.period]}
              </div>
              <div className="rounded-full bg-rose-50 px-2 py-1 text-[10px] font-black text-rose-600 dark:bg-rose-500/15 dark:text-rose-300">
                ON-CALL
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
