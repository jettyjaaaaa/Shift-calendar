import dayjs from "dayjs";
import { parseShiftNote } from "@/lib/shiftNoteMeta";

export type LeaveDayRow = {
  id: number;
  work_date: string;
  note: string | null;
};

export type LeaveMonthGroup = {
  key: string;
  label: string;
  items: Array<{ id: number; work_date: string; noteText: string }>;
};

export function groupLeaveDays(rows: LeaveDayRow[]): LeaveMonthGroup[] {
  const byDate = new Map<string, LeaveDayRow>();
  for (const r of rows) {
    if (!byDate.has(r.work_date)) byDate.set(r.work_date, r);
  }

  const uniqueDays = Array.from(byDate.values()).sort((a, b) => a.work_date.localeCompare(b.work_date));

  const groups = new Map<string, LeaveMonthGroup>();
  for (const r of uniqueDays) {
    const d = dayjs(r.work_date);
    const key = d.format("YYYY-MM");
    const label = d.format("MMMM YYYY");

    const noteText = parseShiftNote(r.note).text;

    if (!groups.has(key)) {
      groups.set(key, { key, label, items: [] });
    }
    groups.get(key)!.items.push({ id: r.id, work_date: r.work_date, noteText });
  }

  return Array.from(groups.values()).sort((a, b) => a.key.localeCompare(b.key));
}
