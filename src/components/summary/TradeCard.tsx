import dayjs from "dayjs";
import { periodLabel } from "@/lib/colors";
import { parseShiftNote } from "@/lib/shiftNoteMeta";
import type { SummaryShiftRow } from "./summaryData";

export function TradeCard({ rows }: { rows: SummaryShiftRow[] }) {
  return (
    <div className="bg-zinc-50 rounded-2xl p-5">
      <div className="text-sm font-bold mb-2">เวรที่ซื้อ/ขายเดือนนี้</div>

      {rows.length === 0 && <div className="text-xs text-zinc-400">ไม่มี</div>}

      <div className="space-y-2">
        {rows.map((r) => {
          const meta = parseShiftNote(r.note).meta;
          const isBought = !!meta.bought;
          const price = isBought ? (meta.bought_price ?? 1200) : (r.sold_price ?? 1200);

          return (
            <div key={r.id} className="bg-white rounded-xl px-3 py-2 border flex justify-between">
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

              <div
                className={
                  isBought
                    ? "text-sm text-emerald-700 font-semibold"
                    : "text-sm text-red-500 font-semibold"
                }
              >
                {price}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
