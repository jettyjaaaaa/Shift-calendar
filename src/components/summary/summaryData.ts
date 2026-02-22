import type { DayType, ShiftPeriod } from "@/lib/types";
import { parseShiftNote } from "@/lib/shiftNoteMeta";

export const HOUR_PER_SHIFT = 8;

export type SummaryShiftRow = {
  id: number;
  work_date: string;
  period: ShiftPeriod;
  day_type: DayType;
  is_ot: boolean;
  sold: boolean;
  sold_to: string | null;
  sold_price: number | null;
  note: string | null;
};

export type SummaryData = {
  totalHours: number;
  otCount: number;
  oncallCount: number;
  tradedRows: SummaryShiftRow[];
  oncallRows: SummaryShiftRow[];
  lostMoney: number;
  spentMoney: number;
};

const periodRank: Record<string, number> = {
  morning: 0,
  afternoon: 1,
  night: 2,
};

function sortByDatePeriod(a: SummaryShiftRow, b: SummaryShiftRow) {
  const d = a.work_date.localeCompare(b.work_date);
  if (d !== 0) return d;
  return (periodRank[a.period] ?? 99) - (periodRank[b.period] ?? 99);
}

export function computeSummaryData(rows: SummaryShiftRow[]): SummaryData {
  const oncallRows = rows
    .filter((r) => r.day_type === "shift")
    .filter((r) => !!parseShiftNote(r.note).meta.oncall)
    .slice()
    .sort(sortByDatePeriod);

  const worked = rows.filter((r) => {
    if (r.day_type !== "shift") return false;
    if (r.sold) return false;
    return !parseShiftNote(r.note).meta.oncall;
  });
  const totalHours = worked.length * HOUR_PER_SHIFT;
  const otCount = rows.filter((r) => r.day_type === "shift" && r.is_ot && !r.sold).length;

  const soldRows = rows.filter((r) => r.sold);
  const boughtRows = rows.filter((r) => parseShiftNote(r.note).meta.bought);

  const tradedRows = rows
    .filter((r) => r.sold || parseShiftNote(r.note).meta.bought)
    .slice()
    .sort(sortByDatePeriod);

  const lostMoney = soldRows.reduce((sum, r) => sum + (r.sold_price ?? 1200), 0);
  const spentMoney = boughtRows.reduce((sum, r) => {
    const meta = parseShiftNote(r.note).meta;
    return sum + (meta.bought_price ?? 1200);
  }, 0);

  return {
    totalHours,
    otCount,
    oncallCount: oncallRows.length,
    tradedRows,
    oncallRows,
    lostMoney,
    spentMoney,
  };
}
