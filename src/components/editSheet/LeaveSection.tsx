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
    <div className="mt-2">
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => setLeaveKind("vacation")}
          className={clsx(
            "rounded-2xl px-4 py-3 text-sm font-extrabold transition",
            leaveKind === "vacation"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          )}
        >
          พักผ่อน
        </button>
        <button
          type="button"
          onClick={() => setLeaveKind("other")}
          className={clsx(
            "rounded-2xl px-4 py-3 text-sm font-extrabold transition",
            leaveKind === "other"
              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
              : "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
          )}
        >
          อื่นๆ
        </button>
      </div>

      {leaveKind === "vacation" && (
        <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
          คงเหลือ {vacationRemain ?? "-"}/{VACATION_TOTAL_DAYS} วัน
        </div>
      )}
    </div>
  );
}
