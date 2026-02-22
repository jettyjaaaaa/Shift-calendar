import clsx from "clsx";
import type { ShiftColor, ShiftPeriod } from "@/lib/types";
import { periodLabel } from "@/lib/colors";
import { colorSwatchClass, colors, SOLD_PRICE_DEFAULT, SOLD_PRICE_STEP } from "./constants";
import type { Draft } from "./types";

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

  return (
    <>
      <div className="mt-3 flex items-center justify-between rounded-2xl bg-zinc-100 px-4 py-3 dark:bg-zinc-900/50">
        <div className="text-sm font-semibold">มีเวรช่วงนี้</div>
        <button
          type="button"
          onClick={() => setDraft({ enabled: !d.enabled })}
          className={clsx(
            "rounded-xl px-3 py-2 text-sm font-extrabold transition",
            d.enabled
              ? "bg-white shadow-sm dark:bg-zinc-950 dark:shadow-none"
              : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
          )}
        >
          {d.enabled ? "มี" : "ไม่มี"}
        </button>
      </div>

      {!d.enabled ? (
        <div className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
          โหมดนี้จะลบเวรช่วง {periodLabel[active]}
        </div>
      ) : (
        <>
          <div className="flex gap-2 mt-2 flex-wrap">
            <button
              type="button"
              onClick={() => setDraft({ is_ot: !d.is_ot, oncall: false })}
              className={clsx(
                "px-3 py-2 rounded-xl",
                d.is_ot
                  ? "bg-black text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100"
              )}
            >
              OT
            </button>

            <button
              type="button"
              onClick={() =>
                setDraft({
                  oncall: !d.oncall,
                  is_ot: !d.oncall ? true : d.is_ot,
                })
              }
              className={clsx(
                "px-3 py-2 rounded-xl",
                d.oncall
                  ? "bg-red-600 text-white"
                  : "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100"
              )}
            >
              oncall
            </button>

            <button
              type="button"
              onClick={() =>
                setDraft({
                  swapped: !d.swapped,
                  swapped_with: !d.swapped ? d.swapped_with : "",
                  swap_remark: !d.swapped ? d.swap_remark : "",
                })
              }
              className={clsx(
                "px-3 py-2 rounded-xl",
                d.swapped
                  ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                  : "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100"
              )}
            >
              สลับเวร
            </button>

            <button
              type="button"
              onClick={() =>
                setDraft({
                  bought: !d.bought,
                  sold: !d.bought ? false : d.sold,
                  sold_to: !d.bought ? "" : d.sold_to,
                  sold_price: !d.bought ? SOLD_PRICE_DEFAULT : d.sold_price,
                })
              }
              className={clsx(
                "px-3 py-2 rounded-xl",
                d.bought
                  ? "bg-emerald-600 text-white"
                  : "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100"
              )}
            >
              ซื้อเวร
            </button>

            <button
              type="button"
              onClick={() =>
                setDraft({
                  sold: !d.sold,
                  bought: !d.sold ? false : d.bought,
                  bought_from: !d.sold ? "" : d.bought_from,
                  bought_price: !d.sold ? SOLD_PRICE_DEFAULT : d.bought_price,
                  sold_price: !d.sold ? d.sold_price || SOLD_PRICE_DEFAULT : d.sold_price,
                })
              }
              className={clsx(
                "px-3 py-2 rounded-xl",
                d.sold
                  ? "bg-red-500 text-white"
                  : "bg-zinc-100 text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100"
              )}
            >
              ขายเวร
            </button>
          </div>

          {d.swapped && (
            <>
              <input
                value={d.swapped_with}
                onChange={(e) => setDraft({ swapped_with: e.target.value })}
                placeholder="สลับกับใคร"
                className="mt-3 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
              <input
                value={d.swap_remark}
                onChange={(e) => setDraft({ swap_remark: e.target.value })}
                placeholder="remark เวรที่สลับมา (optional)"
                className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
            </>
          )}

          {d.bought && (
            <>
              <input
                value={d.bought_from}
                onChange={(e) => setDraft({ bought_from: e.target.value })}
                placeholder="ซื้อจากใคร"
                className="mt-3 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
              <input
                type="number"
                value={d.bought_price}
                onChange={(e) => setDraft({ bought_price: Number(e.target.value) })}
                step={SOLD_PRICE_STEP}
                placeholder="ราคา"
                className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
            </>
          )}

          {d.sold && (
            <>
              <input
                value={d.sold_to}
                onChange={(e) => setDraft({ sold_to: e.target.value })}
                placeholder="ขายให้ใคร"
                className="mt-3 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
              <input
                type="number"
                value={d.sold_price}
                onChange={(e) => setDraft({ sold_price: Number(e.target.value) })}
                step={SOLD_PRICE_STEP}
                placeholder="ราคา"
                className="mt-2 w-full rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
              />
              <div className="mt-2 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setDraft({
                      sold_price: Math.max(0, (d.sold_price || SOLD_PRICE_DEFAULT) - SOLD_PRICE_STEP),
                    })
                  }
                  className="rounded-2xl bg-zinc-100 px-4 py-3 text-sm font-extrabold text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100"
                >
                  -{SOLD_PRICE_STEP}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setDraft({
                      sold_price: (d.sold_price || SOLD_PRICE_DEFAULT) + SOLD_PRICE_STEP,
                    })
                  }
                  className="rounded-2xl bg-zinc-100 px-4 py-3 text-sm font-extrabold text-zinc-900 dark:bg-zinc-900 dark:text-zinc-100"
                >
                  +{SOLD_PRICE_STEP}
                </button>
              </div>
            </>
          )}

          <div className="mt-4 flex gap-2 flex-wrap">
            {colors.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => setDraft({ color: c as ShiftColor })}
                className={clsx(
                  "h-10 w-10 rounded-full",
                  colorSwatchClass[c],
                  d.color === c && "ring-2 ring-black dark:ring-zinc-100"
                )}
              />
            ))}
          </div>

          <textarea
            value={d.note}
            onChange={(e) => setDraft({ note: e.target.value })}
            placeholder="โน้ต/หมายเหตุ (optional)"
            className="mt-3 w-full min-h-[90px] rounded-2xl border border-zinc-200 bg-white px-4 py-3 text-zinc-900 placeholder:text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100 dark:placeholder:text-zinc-500"
          />
        </>
      )}
    </>
  );
}
