import dayjs from "dayjs";
import type { LeaveMonthGroup } from "./leaveData";

export function LeaveMonthSection({ group }: { group: LeaveMonthGroup }) {
  return (
    <section>
      <div className="text-xs font-bold text-zinc-500">{group.label}</div>
      <div className="mt-2 space-y-2">
        {group.items.map((r) => (
          <div key={r.id} className="bg-white border rounded-xl p-3 shadow-sm">
            <div className="font-semibold">{dayjs(r.work_date).format("DD/MM/YYYY")}</div>
            {r.noteText ? <div className="text-xs text-zinc-500 mt-1">{r.noteText}</div> : null}
          </div>
        ))}
      </div>
    </section>
  );
}
