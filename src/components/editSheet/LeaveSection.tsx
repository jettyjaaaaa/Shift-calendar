import clsx from "clsx";
import type { LeaveKind } from "@/lib/types";
import { VACATION_TOTAL_DAYS } from "./constants";

export function LeaveSection({
  leaveKind,
  setLeaveKind,
  vacationRemain,
}: {
  leaveKind: LeaveKind;
  setLeaveKind: (v: LeaveKind) => void;
  vacationRemain: number | null;
}) {
  return (
    <div className="mt-4">
      <div className="mb-2 text-xs font-bold text-zinc-500 dark:text-zinc-400">ประเภทการลา</div>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setLeaveKind("vacation")}
          className={clsx(
            "rounded-2xl border px-4 py-3 text-sm font-extrabold transition active:scale-[0.98]",
            leaveKind === "vacation"
              ? "border-amber-400 bg-amber-50 text-amber-950 dark:border-amber-500 dark:bg-amber-500/15 dark:text-amber-100"
              : "border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
          )}
        >
          พักผ่อน
        </button>
        <button
          type="button"
          onClick={() => setLeaveKind("other")}
          className={clsx(
            "rounded-2xl border px-4 py-3 text-sm font-extrabold transition active:scale-[0.98]",
            leaveKind === "other"
              ? "border-amber-400 bg-amber-50 text-amber-950 dark:border-amber-500 dark:bg-amber-500/15 dark:text-amber-100"
              : "border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
          )}
        >
          อื่นๆ
        </button>
      </div>

      {leaveKind === "vacation" && (
        <div className="mt-3 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-900 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-100">
          วันลาพักผ่อนคงเหลือ {vacationRemain ?? "-"}/{VACATION_TOTAL_DAYS} วัน
        </div>
      )}
    </div>
  );
}
