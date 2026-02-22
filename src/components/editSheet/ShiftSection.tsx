import clsx from "clsx";
import type { ShiftColor, ShiftPeriod } from "@/lib/types";
import { periodLabel } from "@/lib/colors";
import { colorSwatchClass, colors, SOLD_PRICE_DEFAULT, SOLD_PRICE_STEP } from "./constants";
import type { Draft } from "./types";

const colorLabel: Record<string, string> = {
  green: "เขียว",
  blue: "ฟ้า",
  yellow: "เหลือง",
  orange: "ส้ม",
  pink: "ชมพู",
  white: "ขาว",
};

export function ShiftSection({
  active,
  draft,
  setDraft,
}: {
  active: ShiftPeriod;
  draft: Draft;
  setDraft: (patch: Partial<Draft>) => void;
}) {
  const d = draft;
  const actionClass = (selected: boolean, selectedClass: string) =>
    clsx(
      "min-h-12 rounded-2xl border px-2 py-2.5 text-sm font-extrabold transition active:scale-[0.98]",
      selected
        ? selectedClass
        : "border-zinc-200 bg-white text-zinc-700 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
    );

  return (
    <div className="pb-2">
      <div className="mt-3 flex items-center justify-between rounded-2xl border border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-900">
        <div>
          <div className="text-sm font-black">มีเวรช่วง{periodLabel[active]}</div>
          <div className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400">
            ปิดเมื่อต้องการลบเวรช่วงนี้
          </div>
        </div>
        <button
          type="button"
          onClick={() => setDraft({ enabled: !d.enabled })}
          className={clsx(
            "relative h-8 w-14 shrink-0 rounded-full transition-colors",
            d.enabled ? "bg-amber-400" : "bg-zinc-300 dark:bg-zinc-700"
          )}
          role="switch"
          aria-checked={d.enabled}
          aria-label={`มีเวรช่วง${periodLabel[active]}`}
        >
          <span
            className={clsx(
              "absolute left-0 top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-transform",
              d.enabled ? "translate-x-7" : "translate-x-1"
            )}
          />
        </button>
      </div>

      {!d.enabled ? (
        <div className="mt-3 rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-5 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900/50 dark:text-zinc-400">
          เมื่อบันทึก ระบบจะลบเวรช่วง{periodLabel[active]}
        </div>
      ) : (
        <>
          <section className="mt-4">
            <div className="mb-2 text-xs font-bold text-zinc-500 dark:text-zinc-400">ประเภทเวร</div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDraft({ is_ot: !d.is_ot, oncall: false })}
                aria-pressed={d.is_ot && !d.oncall}
                className={actionClass(
                  d.is_ot && !d.oncall,
                  "border-sky-600 bg-sky-600 text-white shadow-sm shadow-sky-200 dark:shadow-none"
                )}
              >
                ◷ เวร OT
              </button>
              <button
                type="button"
                onClick={() =>
                  setDraft({
                    oncall: !d.oncall,
                    is_ot: !d.oncall ? true : d.is_ot,
                  })
                }
                aria-pressed={d.oncall}
                className={actionClass(
                  d.oncall,
                  "border-rose-500 bg-rose-500 text-white shadow-sm shadow-rose-200 dark:shadow-none"
                )}
              >
                ● On-call
              </button>
            </div>
          </section>

          <section className="mt-4">
            <div className="mb-2 text-xs font-bold text-zinc-500 dark:text-zinc-400">
              รับ–ส่งเวร
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() =>
                  setDraft({
                    swapped: !d.swapped,
                    swapped_with: !d.swapped ? d.swapped_with : "",
                    swap_remark: "",
                    bought: false,
                    bought_from: "",
                    bought_price: SOLD_PRICE_DEFAULT,
                    sold: false,
                    sold_to: "",
                    sold_price: SOLD_PRICE_DEFAULT,
                  })
                }
                aria-pressed={d.swapped}
                className={actionClass(
                  d.swapped,
                  "border-violet-600 bg-violet-600 text-white shadow-sm shadow-violet-200 dark:shadow-none"
                )}
              >
                ⇅ แลกเวร
              </button>
              <button
                type="button"
                onClick={() =>
                  setDraft({
                    bought: !d.bought,
                    sold: false,
                    sold_to: "",
                    sold_price: SOLD_PRICE_DEFAULT,
                    swapped: false,
                    swapped_with: "",
                    swap_remark: "",
                  })
                }
                aria-pressed={d.bought}
                className={actionClass(
                  d.bought,
                  "border-emerald-600 bg-emerald-600 text-white shadow-sm shadow-emerald-200 dark:shadow-none"
                )}
              >
                ＋ ซื้อ
              </button>
              <button
                type="button"
                onClick={() =>
                  setDraft({
                    sold: !d.sold,
                    bought: false,
                    bought_from: "",
                    bought_price: SOLD_PRICE_DEFAULT,
                    sold_price: !d.sold ? d.sold_price || SOLD_PRICE_DEFAULT : d.sold_price,
                    swapped: false,
                    swapped_with: "",
                    swap_remark: "",
                  })
                }
                aria-pressed={d.sold}
                className={actionClass(
                  d.sold,
                  "border-rose-500 bg-rose-500 text-white shadow-sm shadow-rose-200 dark:shadow-none"
                )}
              >
                − ขาย
              </button>
            </div>
          </section>

          {d.swapped && (
            <div className="mt-3 rounded-2xl border border-violet-100 bg-violet-50/70 p-3 dark:border-violet-500/20 dark:bg-violet-500/10">
              <div className="grid grid-cols-2 gap-2 rounded-xl bg-white/75 p-1 dark:bg-zinc-900/70">
                <button
                  type="button"
                  onClick={() => setDraft({ swap_direction: "out" })}
                  className={clsx(
                    "rounded-lg px-2 py-2.5 text-sm font-bold transition",
                    d.swap_direction === "out"
                      ? "bg-rose-100 text-rose-700 dark:bg-rose-500/20 dark:text-rose-200"
                      : "text-zinc-500 dark:text-zinc-400"
                  )}
                  aria-pressed={d.swap_direction === "out"}
                >
                  ↑ ส่งเวรออก
                </button>
                <button
                  type="button"
                  onClick={() => setDraft({ swap_direction: "in" })}
                  className={clsx(
                    "rounded-lg px-2 py-2.5 text-sm font-bold transition",
                    d.swap_direction === "in"
                      ? "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-200"
                      : "text-zinc-500 dark:text-zinc-400"
                  )}
                  aria-pressed={d.swap_direction === "in"}
                >
                  ↓ รับเวรเข้า
                </button>
              </div>
              <label className="mt-3 block text-xs font-bold text-zinc-600 dark:text-zinc-300">
                {d.swap_direction === "out" ? "ส่งเวรให้" : "รับเวรจาก"}
                <input
                  value={d.swapped_with}
                  onChange={(event) => setDraft({ swapped_with: event.target.value })}
                  placeholder="กรอกชื่อ"
                  className="mt-1.5 w-full rounded-xl border border-violet-200 bg-white px-3.5 py-3 text-base font-medium text-zinc-900 placeholder:text-zinc-400 dark:border-violet-500/30 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </label>
            </div>
          )}

          {!d.swapped && d.bought && (
            <TradeDetails
              tone="emerald"
              personLabel="ซื้อเวรจาก"
              person={d.bought_from}
              onPersonChange={(value) => setDraft({ bought_from: value })}
              price={d.bought_price}
              onPriceChange={(value) => setDraft({ bought_price: value })}
            />
          )}

          {!d.swapped && d.sold && (
            <TradeDetails
              tone="rose"
              personLabel="ขายเวรให้"
              person={d.sold_to}
              onPersonChange={(value) => setDraft({ sold_to: value })}
              price={d.sold_price}
              onPriceChange={(value) => setDraft({ sold_price: value })}
            />
          )}

          <section className="mt-4">
            <div className="mb-2 text-xs font-bold text-zinc-500 dark:text-zinc-400">
              สีเวรในปฏิทิน
            </div>
            <div className="flex items-center justify-between gap-2 rounded-2xl border border-zinc-200 bg-white p-2.5 dark:border-zinc-800 dark:bg-zinc-900">
              {colors.map((color) => (
                <button
                  type="button"
                  key={color}
                  onClick={() => setDraft({ color: color as ShiftColor })}
                  aria-label={`เลือกสี${colorLabel[color]}`}
                  aria-pressed={d.color === color}
                  className={clsx(
                    "h-9 w-9 rounded-full border-2 border-white shadow-sm transition active:scale-90 dark:border-zinc-900",
                    colorSwatchClass[color],
                    d.color === color &&
                      "ring-2 ring-zinc-900 ring-offset-2 dark:ring-white dark:ring-offset-zinc-900"
                  )}
                />
              ))}
            </div>
          </section>

          <label className="mt-4 block text-xs font-bold text-zinc-500 dark:text-zinc-400">
            โน้ตเพิ่มเติม <span className="font-normal text-zinc-400">(ไม่บังคับ)</span>
            <textarea
              value={d.note}
              onChange={(event) => setDraft({ note: event.target.value })}
              placeholder="เช่น เปลี่ยนเวลา หรือรายละเอียดอื่นๆ"
              className="mt-1.5 min-h-20 w-full resize-none rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-base font-medium text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
            />
          </label>
        </>
      )}
    </div>
  );
}

function TradeDetails({
  tone,
  personLabel,
  person,
  onPersonChange,
  price,
  onPriceChange,
}: {
  tone: "emerald" | "rose";
  personLabel: string;
  person: string;
  onPersonChange: (value: string) => void;
  price: number;
  onPriceChange: (value: number) => void;
}) {
  const toneClass =
    tone === "emerald"
      ? "border-emerald-100 bg-emerald-50/70 dark:border-emerald-500/20 dark:bg-emerald-500/10"
      : "border-rose-100 bg-rose-50/70 dark:border-rose-500/20 dark:bg-rose-500/10";

  return (
    <div className={clsx("mt-3 rounded-2xl border p-3", toneClass)}>
      <label className="block text-xs font-bold text-zinc-600 dark:text-zinc-300">
        {personLabel}
        <input
          value={person}
          onChange={(event) => onPersonChange(event.target.value)}
          placeholder="กรอกชื่อ"
          className="mt-1.5 w-full rounded-xl border border-zinc-200 bg-white px-3.5 py-3 text-base font-medium text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
        />
      </label>
      <div className="mt-3 text-xs font-bold text-zinc-600 dark:text-zinc-300">ราคา</div>
      <div className="mt-1.5 grid grid-cols-[48px_1fr_48px] gap-2">
        <button
          type="button"
          onClick={() =>
            onPriceChange(Math.max(0, (price || SOLD_PRICE_DEFAULT) - SOLD_PRICE_STEP))
          }
          className="rounded-xl border border-zinc-200 bg-white text-xl font-bold dark:border-zinc-700 dark:bg-zinc-900"
          aria-label={`ลดราคา ${SOLD_PRICE_STEP} บาท`}
        >
          −
        </button>
        <div className="relative">
          <input
            type="number"
            inputMode="numeric"
            value={price}
            onChange={(event) => onPriceChange(Number(event.target.value))}
            step={SOLD_PRICE_STEP}
            className="h-12 w-full rounded-xl border border-zinc-200 bg-white px-3 pr-12 text-center text-base font-black text-zinc-900 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            aria-label="ราคา"
          />
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-zinc-400">
            บาท
          </span>
        </div>
        <button
          type="button"
          onClick={() => onPriceChange((price || SOLD_PRICE_DEFAULT) + SOLD_PRICE_STEP)}
          className="rounded-xl border border-zinc-200 bg-white text-xl font-bold dark:border-zinc-700 dark:bg-zinc-900"
          aria-label={`เพิ่มราคา ${SOLD_PRICE_STEP} บาท`}
        >
          +
        </button>
      </div>
    </div>
  );
}
