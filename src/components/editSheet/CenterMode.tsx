import clsx from "clsx";
import type { DayType } from "@/lib/types";

export function CenterMode({
  value,
  onChange,
}: {
  value: DayType;
  onChange: (v: DayType) => void;
}) {
  const options: Array<{ value: DayType; label: string; icon: string; hint: string }> = [
    { value: "shift", label: "ทำงาน", icon: "●", hint: "เพิ่มหรือแก้ไขเวร" },
    { value: "off", label: "หยุด", icon: "○", hint: "วันหยุด" },
    { value: "leave", label: "ลา", icon: "◇", hint: "บันทึกวันลา" },
  ];

  const btn = ({ value: optionValue, label, icon, hint }: (typeof options)[number]) => (
    <button
      type="button"
      onClick={() => onChange(optionValue)}
      aria-pressed={value === optionValue}
      className={clsx(
        "h-full w-full min-w-0 rounded-2xl border px-2 py-3 text-left transition active:scale-[0.98]",
        value === optionValue
          ? "border-amber-400 bg-amber-50 text-amber-950 shadow-sm dark:border-amber-500/70 dark:bg-amber-500/15 dark:text-amber-100"
          : "border-zinc-200 bg-white text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300"
      )}
    >
      <span className="flex items-center gap-1.5 text-sm font-black">
        <span className={value === optionValue ? "text-amber-500" : "text-zinc-400"}>{icon}</span>
        {label}
      </span>
      <span className="mt-0.5 block truncate text-[10px] font-medium opacity-65">{hint}</span>
    </button>
  );

  return (
    <div className="mt-3 grid grid-cols-3 gap-2">
      {options.map((option) => (
        <div key={option.value}>{btn(option)}</div>
      ))}
    </div>
  );
}
