"use client";

import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { supabase } from "@/lib/supabaseClient";
import { DayType, LeaveKind, ShiftColor, ShiftPeriod, ShiftRow } from "@/lib/types";
import { periodLabel } from "@/lib/colors";

const periods: ShiftPeriod[] = ["morning", "afternoon", "night"];
const colors: ShiftColor[] = ["green", "blue", "yellow", "orange", "pink", "white"];
const VACATION_TOTAL_DAYS = 7;
const SOLD_PRICE_DEFAULT = 1200;
const SOLD_PRICE_STEP = 100;

type Draft = {
  enabled: boolean;
  color: ShiftColor | null;
  is_ot: boolean;
  swapped: boolean;
  swapped_with: string;
  sold: boolean;
  sold_to: string;
  sold_price: number;
  note: string;
};

const colorSwatchClass: Record<ShiftColor, string> = {
  green: "bg-green-500",
  blue: "bg-sky-500",
  yellow: "bg-yellow-300",
  orange: "bg-orange-500",
  pink: "bg-pink-500",
  white: "bg-white border border-zinc-300",
  red: "bg-red-500",
};

function CenterMode({ value, onChange }: { value: DayType; onChange: (v: DayType) => void }) {
  const btn = (v: DayType, label: string) => (
    <button
      type="button"
      onClick={() => onChange(v)}
      className={clsx(
        "flex-1 rounded-2xl px-4 py-3 text-sm font-extrabold transition",
        value === v ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700"
      )}
    >
      {label}{" "}
    </button>
  );

  return (
    <div className="flex gap-2 mt-3">
      {btn("shift", "ทำงาน")}
      {btn("off", "หยุด")}
      {btn("leave", "ลา")}{" "}
    </div>
  );
}

function Segmented({
  value,
  onChange,
}: {
  value: ShiftPeriod;
  onChange: (v: ShiftPeriod) => void;
}) {
  return (
    <div className="grid grid-cols-3 rounded-2xl bg-zinc-100 p-1 mt-3">
      {periods.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={clsx(
            "rounded-xl px-3 py-2 text-sm font-semibold transition",
            value === p ? "bg-white shadow-sm" : "text-zinc-600"
          )}
        >
          {periodLabel[p]}{" "}
        </button>
      ))}{" "}
    </div>
  );
}

export function EditSheet({
  open,
  onClose,
  dateISO,
  shifts,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  dateISO: string | null;
  shifts: ShiftRow[];
  onSaved: () => void;
}) {
  const existingMap = useMemo(() => {
    const m = new Map<ShiftPeriod, ShiftRow>();
    shifts.forEach((s) => m.set(s.period, s));
    return m;
  }, [shifts]);

  const [active, setActive] = useState<ShiftPeriod>("morning");
  const [saving, setSaving] = useState(false);
  const [allDayType, setAllDayType] = useState<DayType>("shift");
  const [leaveKind, setLeaveKind] = useState<LeaveKind>("vacation");
  const [vacationRemain, setVacationRemain] = useState<number | null>(null);

  const [drafts, setDrafts] = useState<Record<ShiftPeriod, Draft>>({
    morning: {
      enabled: true,
      color: "green",
      is_ot: false,
      swapped: false,
      swapped_with: "",
      sold: false,
      sold_to: "",
      sold_price: SOLD_PRICE_DEFAULT,
      note: "",
    },
    afternoon: {
      enabled: true,
      color: "blue",
      is_ot: false,
      swapped: false,
      swapped_with: "",
      sold: false,
      sold_to: "",
      sold_price: SOLD_PRICE_DEFAULT,
      note: "",
    },
    night: {
      enabled: true,
      color: "yellow",
      is_ot: false,
      swapped: false,
      swapped_with: "",
      sold: false,
      sold_to: "",
      sold_price: SOLD_PRICE_DEFAULT,
      note: "",
    },
  });

  useEffect(() => {
    if (!dateISO) return;

    const detected = new Set<DayType>();
    for (const p of periods) {
      const ex = existingMap.get(p);
      if (ex?.day_type) detected.add(ex.day_type);
    }
    setAllDayType(detected.size === 1 ? Array.from(detected)[0] : "shift");

    const detectedLeaveKind = new Set<LeaveKind>();
    for (const p of periods) {
      const ex = existingMap.get(p);
      if (ex?.leave_kind) detectedLeaveKind.add(ex.leave_kind);
    }
    setLeaveKind(detectedLeaveKind.size === 1 ? Array.from(detectedLeaveKind)[0] : "vacation");

    const next = {} as Record<ShiftPeriod, Draft>;
    for (const p of periods) {
      const ex = existingMap.get(p);
      const defaultColor: ShiftColor =
        p === "morning" ? "green" : p === "afternoon" ? "blue" : "yellow";
      next[p] = {
        enabled: !!ex || detected.size === 0,
        color: ex?.color ?? defaultColor,
        is_ot: ex?.is_ot ?? false,
        swapped: ex?.swapped ?? false,
        swapped_with: ex?.swapped_with ?? "",
        sold: ex?.sold ?? false,
        sold_to: ex?.sold_to ?? "",
        sold_price: ex?.sold_price ?? SOLD_PRICE_DEFAULT,
        note: ex?.note ?? "",
      };
    }
    setDrafts(next);
  }, [dateISO, existingMap]);

  useEffect(() => {
    if (!dateISO) return;
    if (allDayType !== "leave" || leaveKind !== "vacation") {
      setVacationRemain(null);
      return;
    }

    const d = dayjs(dateISO);
    const fiscal = d.month() >= 9 ? d.year() + 1 : d.year();

    (async () => {
      const { data, error } = await supabase
        .from("vacation_remaining_public")
        .select("remaining_days")
        .eq("fiscal_year", fiscal)
        .maybeSingle();

      if (error) {
        console.error(error);
        setVacationRemain(null);
        return;
      }

      setVacationRemain(Number(data?.remaining_days ?? 0));
    })();
  }, [allDayType, dateISO, leaveKind]);

  if (!open || !dateISO) return null;

  const d = drafts[active];

  const setDraft = (patch: Partial<Draft>) => {
    setDrafts((prev) => ({ ...prev, [active]: { ...prev[active], ...patch } }));
  };

  const getExistingId = async (period: ShiftPeriod) => {
    const byProp = existingMap.get(period)?.id;
    if (byProp) return byProp;

    const { data, error } = await supabase
      .from("shifts_public")
      .select("id")
      .eq("work_date", dateISO)
      .eq("period", period)
      .maybeSingle();

    if (error) throw error;
    const row = data as { id: number } | null;
    return row?.id;
  };

  const saveAll = async () => {
    try {
      setSaving(true);

      const isShift = allDayType === "shift";

      for (const p of periods) {
        const x = drafts[p];

        if (isShift && !x.enabled) {
          const existingId = await getExistingId(p);
          if (existingId) {
            const { error } = await supabase.from("shifts_public").delete().eq("id", existingId);
            if (error) throw error;
          }
          continue;
        }

        const payload = {
          work_date: dateISO,
          period: p,
          day_type: allDayType,
          color: isShift ? (x.sold ? "red" : x.color) : null,
          is_ot: isShift ? x.is_ot : false,
          swapped: isShift ? x.swapped : false,
          swapped_with: isShift && x.swapped ? x.swapped_with || null : null,
          sold: isShift ? x.sold : false,
          sold_to: isShift && x.sold ? x.sold_to || null : null,
          sold_price: isShift && x.sold ? x.sold_price || SOLD_PRICE_DEFAULT : 0,
          note: x.note?.trim() ? x.note.trim() : null,
          leave_kind: allDayType === "leave" ? leaveKind : null,
        } satisfies Partial<ShiftRow> & Pick<ShiftRow, "work_date" | "period" | "day_type">;

        const existingId = await getExistingId(p);
        if (existingId) {
          const { error } = await supabase
            .from("shifts_public")
            .update(payload)
            .eq("id", existingId);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("shifts_public").insert(payload);
          if (error) throw error;
        }
      }

      onSaved();
      onClose();
    } catch (e: unknown) {
      console.error(e);
      const message =
        e instanceof Error
          ? e.message
          : typeof e === "object" && e && "message" in e
            ? String((e as { message: unknown }).message)
            : "บันทึกไม่สำเร็จ";
      alert(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      {" "}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white shadow-2xl max-h-[85vh] pb-[env(safe-area-inset-bottom)]">
        <div className="px-4 pt-4 pb-3">
          <div className="text-lg font-bold">{dateISO}</div>

          <CenterMode value={allDayType} onChange={setAllDayType} />
          {allDayType === "shift" && <Segmented value={active} onChange={setActive} />}
        </div>

        <div className="px-4 pb-6">
          {allDayType === "leave" && (
            <div className="mt-2">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setLeaveKind("vacation")}
                  className={clsx(
                    "rounded-2xl px-4 py-3 text-sm font-extrabold transition",
                    leaveKind === "vacation"
                      ? "bg-zinc-900 text-white"
                      : "bg-zinc-100 text-zinc-700"
                  )}
                >
                  พักผ่อน
                </button>
                <button
                  type="button"
                  onClick={() => setLeaveKind("other")}
                  className={clsx(
                    "rounded-2xl px-4 py-3 text-sm font-extrabold transition",
                    leaveKind === "other" ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700"
                  )}
                >
                  อื่นๆ
                </button>
              </div>

              {leaveKind === "vacation" && (
                <div className="mt-2 text-xs text-zinc-500">
                  คงเหลือ {vacationRemain ?? "-"}/{VACATION_TOTAL_DAYS} วัน
                </div>
              )}
            </div>
          )}

          {allDayType === "shift" && (
            <>
              <div className="mt-3 flex items-center justify-between rounded-2xl bg-zinc-100 px-4 py-3">
                <div className="text-sm font-semibold">มีเวรช่วงนี้</div>
                <button
                  type="button"
                  onClick={() => setDraft({ enabled: !d.enabled })}
                  className={clsx(
                    "rounded-xl px-3 py-2 text-sm font-extrabold transition",
                    d.enabled ? "bg-white shadow-sm" : "bg-zinc-200 text-zinc-700"
                  )}
                >
                  {d.enabled ? "มี" : "ไม่มี"}
                </button>
              </div>

              {!d.enabled ? (
                <div className="mt-3 text-sm text-zinc-500">
                  โหมดนี้จะลบเวรช่วง {periodLabel[active]}
                </div>
              ) : (
                <>
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setDraft({ is_ot: !d.is_ot })}
                      className={clsx(
                        "px-3 py-2 rounded-xl",
                        d.is_ot ? "bg-black text-white" : "bg-zinc-100"
                      )}
                    >
                      OT
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setDraft({
                          sold: !d.sold,
                          sold_price: !d.sold ? d.sold_price || SOLD_PRICE_DEFAULT : d.sold_price,
                        })
                      }
                      className={clsx(
                        "px-3 py-2 rounded-xl",
                        d.sold ? "bg-red-500 text-white" : "bg-zinc-100"
                      )}
                    >
                      ขายเวร
                    </button>
                  </div>

                  {d.sold && (
                    <>
                      <input
                        value={d.sold_to}
                        onChange={(e) => setDraft({ sold_to: e.target.value })}
                        placeholder="ขายให้ใคร"
                        className="mt-3 w-full rounded-2xl border px-4 py-3"
                      />
                      <input
                        type="number"
                        value={d.sold_price}
                        onChange={(e) => setDraft({ sold_price: Number(e.target.value) })}
                        step={SOLD_PRICE_STEP}
                        placeholder="ราคา"
                        className="mt-2 w-full rounded-2xl border px-4 py-3"
                      />
                      <div className="mt-2 grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            setDraft({
                              sold_price: Math.max(
                                0,
                                (d.sold_price || SOLD_PRICE_DEFAULT) - SOLD_PRICE_STEP
                              ),
                            })
                          }
                          className="rounded-2xl bg-zinc-100 px-4 py-3 text-sm font-extrabold"
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
                          className="rounded-2xl bg-zinc-100 px-4 py-3 text-sm font-extrabold"
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
                        onClick={() => setDraft({ color: c })}
                        className={clsx(
                          "h-10 w-10 rounded-full",
                          colorSwatchClass[c],
                          d.color === c && "ring-2 ring-black"
                        )}
                      />
                    ))}
                  </div>
                </>
              )}
            </>
          )}

          <button
            type="button"
            disabled={saving}
            onClick={saveAll}
            className={clsx(
              "mt-6 w-full py-4 rounded-2xl font-bold",
              saving ? "bg-zinc-400 text-white" : "bg-black text-white"
            )}
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}
