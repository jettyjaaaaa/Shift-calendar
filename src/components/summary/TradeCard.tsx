import dayjs from "dayjs";
import { periodLabel } from "@/lib/colors";
import { parseShiftNote } from "@/lib/shiftNoteMeta";
import type { SummaryShiftRow } from "./summaryData";

export function TradeCard({ rows }: { rows: SummaryShiftRow[] }) {
  return (
    <section className="rounded-[22px] border border-white/80 bg-white/85 p-4 shadow-[0_16px_40px_-32px_rgba(39,39,42,0.65)] dark:border-white/10 dark:bg-zinc-900/75">
      <div className="mb-3 text-sm font-black">รายการซื้อ–ขายเวร</div>

      {rows.length === 0 && (
        <div className="rounded-xl bg-zinc-50 px-3 py-4 text-center text-xs text-zinc-400 dark:bg-zinc-950/50 dark:text-zinc-500">
          ไม่มีรายการซื้อ–ขาย
        </div>
      )}

      <div className="space-y-2">
        {rows.map((r) => {
          const meta = parseShiftNote(r.note).meta;
          const isBought = !!meta.bought;
          const price = isBought ? (meta.bought_price ?? 1200) : (r.sold_price ?? 1200);

          return (
            <div
              key={r.id}
              className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-3 py-2.5 dark:border-zinc-800 dark:bg-zinc-950"
            >
              <div>
                <div className="text-sm">
                  {dayjs(r.work_date).format("DD/MM/YYYY")} • {periodLabel[r.period]}{" "}
                  <span className={isBought ? "text-emerald-700" : "text-red-600"}>
                    {isBought ? "+" : "-"}
                  </span>
                </div>
                <div className="text-xs text-zinc-500 dark:text-zinc-400">
                  {isBought ? `ซื้อจาก ${meta.bought_from || "-"}` : `ขายให้ ${r.sold_to || "-"}`}
                </div>
              </div>

              <div
                className={
                  isBought
                    ? "text-sm text-emerald-700 font-semibold"
                    : "text-sm text-red-500 font-semibold"
                }
              >
                ฿{price.toLocaleString("th-TH")}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
