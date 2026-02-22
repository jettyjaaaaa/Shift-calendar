import Link from "next/link";
import type { Dayjs } from "dayjs";

export function CalendarHeader({
  month,
  onPrevious,
  onNext,
  onToday,
}: {
  month: Dayjs;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
}) {
  return (
    <header className="rounded-[22px] border border-amber-100/90 bg-white/85 p-3 shadow-[0_18px_45px_-30px_rgba(120,53,15,0.38)] backdrop-blur-xl dark:border-white/10 dark:bg-zinc-900/80 min-[480px]:rounded-[28px] min-[480px]:p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-amber-600 min-[480px]:text-xs min-[480px]:tracking-[0.18em]">
            ตารางเวร
          </p>
          <h1 className="mt-0.5 text-xl font-black tracking-tight min-[480px]:mt-1 min-[480px]:text-2xl">
            {month.format("MMMM YYYY")}
          </h1>
        </div>
        <Link
          href="/summary"
          className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-zinc-950 px-3 text-xs font-bold text-white shadow-lg shadow-zinc-950/15 transition active:scale-[0.97] dark:bg-white dark:text-zinc-950 min-[480px]:h-11 min-[480px]:gap-2 min-[480px]:rounded-2xl min-[480px]:px-4 min-[480px]:text-sm"
          aria-label="เปิดสรุปเวร"
        >
          <span aria-hidden="true">▤</span>
          สรุป
        </Link>
      </div>

      <div className="mt-3 grid grid-cols-[40px_1fr_40px] items-center gap-1.5 min-[480px]:mt-4 min-[480px]:grid-cols-[44px_1fr_44px] min-[480px]:gap-2">
        <button
          type="button"
          onClick={onPrevious}
          className="grid h-10 w-10 place-items-center rounded-xl bg-zinc-100 text-xl font-bold transition active:scale-95 dark:bg-zinc-800 min-[480px]:h-11 min-[480px]:w-11 min-[480px]:rounded-2xl"
          aria-label="เดือนก่อนหน้า"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={onToday}
          className="h-10 rounded-xl bg-amber-100 text-xs font-extrabold text-amber-900 transition active:scale-[0.98] dark:bg-amber-500/15 dark:text-amber-200 min-[480px]:h-11 min-[480px]:rounded-2xl min-[480px]:text-sm"
        >
          กลับไปเดือนนี้
        </button>
        <button
          type="button"
          onClick={onNext}
          className="grid h-10 w-10 place-items-center rounded-xl bg-zinc-100 text-xl font-bold transition active:scale-95 dark:bg-zinc-800 min-[480px]:h-11 min-[480px]:w-11 min-[480px]:rounded-2xl"
          aria-label="เดือนถัดไป"
        >
          ›
        </button>
      </div>
    </header>
  );
}
