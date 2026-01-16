"use client";

import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { DayType, ShiftColor, ShiftPeriod, ShiftRow } from "@/lib/types";
import { periodLabel } from "@/lib/colors";

const periods: ShiftPeriod[] = ["morning", "afternoon", "night"];
const colors: ShiftColor[] = ["green", "blue", "yellow", "orange", "pink", "white"];

type Draft = {
  enabled: boolean;               // ✅ ใหม่: ช่วงนี้เลือกแล้วไหม
  day_type: DayType;              // shift/off/leave (ใช้เมื่อ enabled=true)
  color: ShiftColor | null;
  is_ot: boolean;
  swapped: boolean;
  swapped_with: string;
  note: string;
};

const colorSwatchClass: Record<ShiftColor, string> = {
  green: "bg-green-500",
  blue: "bg-sky-500",
  yellow: "bg-yellow-300",
  orange: "bg-orange-500",
  pink: "bg-pink-500",
  white: "bg-white border border-zinc-300",
};

function Segmented({
  value,
  onChange,
}: {
  value: ShiftPeriod;
  onChange: (v: ShiftPeriod) => void;
}) {
  return (
    <div className="grid grid-cols-3 rounded-2xl bg-zinc-100 p-1">
      {periods.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={clsx(
            "rounded-xl px-3 py-2 text-sm font-semibold transition",
            value === p ? "bg-white shadow-sm" : "text-zinc-600"
          )}
          type="button"
        >
          {periodLabel[p]}
        </button>
      ))}
    </div>
  );
}

function IconToggle({
  active,
  onToggle,
  icon,
  ariaLabel,
}: {
  active: boolean;
  onToggle: () => void;
  icon: string;
  ariaLabel: string;
}) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      onClick={onToggle}
      className={clsx(
        "h-11 w-11 rounded-2xl grid place-items-center text-lg font-bold transition",
        active ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700"
      )}
    >
      {icon}
    </button>
  );
}

function CenterMode({
  value,
  onChange,
}: {
  value: DayType; // shift/off/leave (ทั้งวัน)
  onChange: (v: DayType) => void;
}) {
  const btn = (v: DayType, label: string) => (
    <button
      type="button"
      onClick={() => onChange(v)}
      className={clsx(
        "flex-1 rounded-2xl px-4 py-3 text-sm font-extrabold transition",
        value === v ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700"
      )}
    >
      {label}
    </button>
  );

  return (
    <div className="flex gap-2">
      {btn("shift", "ทำงาน")}
      {btn("off", "หยุด")}
      {btn("leave", "ลา")}
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

  const [drafts, setDrafts] = useState<Record<ShiftPeriod, Draft>>(() => ({
    morning: { enabled: false, day_type: "shift", color: "green", is_ot: false, swapped: false, swapped_with: "", note: "" },
    afternoon: { enabled: false, day_type: "shift", color: "blue", is_ot: false, swapped: false, swapped_with: "", note: "" },
    night: { enabled: false, day_type: "shift", color: "yellow", is_ot: false, swapped: false, swapped_with: "", note: "" },
  }));

  useEffect(() => {
    if (!dateISO) return;

    const next: any = {};
    for (const p of periods) {
      const ex = existingMap.get(p);
      next[p] = {
        enabled: !!ex,
        day_type: ex?.day_type ?? "shift",
        color: (ex?.color ?? "green") as ShiftColor | null,
        is_ot: ex?.is_ot ?? false,
        swapped: ex?.swapped ?? false,
        swapped_with: ex?.swapped_with ?? "",
        note: ex?.note ?? "",
      };

      if (next[p].day_type !== "shift") {
        next[p].color = null;
        next[p].is_ot = false;
        next[p].swapped = false;
        next[p].swapped_with = "";
      }
    }
    setDrafts(next);

    const hasAll = periods.every((p) => !!next[p].enabled);
    if (hasAll) {
      const t0 = next.morning.day_type as DayType;
      const t1 = next.afternoon.day_type as DayType;
      const t2 = next.night.day_type as DayType;
      if (t0 === t1 && t1 === t2) setAllDayType(t0);
      else setAllDayType("shift");
    } else {
      setAllDayType("shift");
    }
  }, [dateISO, existingMap]);

  if (!open || !dateISO) return null;

  const d = drafts[active];

  const setDraft = (patch: Partial<Draft>) => {
    setDrafts((prev) => ({ ...prev, [active]: { ...prev[active], ...patch } }));
  };

  const applyAllDay = (v: DayType) => {
    setAllDayType(v);
    setDrafts((prev) => {
      const next: any = { ...prev };
      for (const p of periods) {
        next[p] = {
          ...next[p],
          enabled: true,               
          day_type: v,
          color: v === "shift" ? (next[p].color ?? "green") : null,
          is_ot: v === "shift" ? next[p].is_ot : false,
          swapped: v === "shift" ? next[p].swapped : false,
          swapped_with: v === "shift" ? next[p].swapped_with : "",
        };
      }
      return next;
    });
  };

  const toggleEnabled = () => {
    const nextEnabled = !d.enabled;
    setDraft({
      enabled: nextEnabled,
      day_type: "shift",
      color: d.color ?? "green",
      is_ot: false,
      swapped: false,
      swapped_with: "",
    });
  };

  const saveAll = async () => {
    try {
      setSaving(true);

      for (const p of periods) {
        const ex = existingMap.get(p);
        const x = drafts[p];

        if (!x.enabled) {
          if (ex) {
            const { error } = await supabase.from("shifts_public").delete().eq("id", ex.id);
            if (error) throw error;
          }
          continue;
        }

        const payload = {
          work_date: dateISO,
          period: p,
          day_type: x.day_type,
          color: x.day_type === "shift" ? x.color : null,
          is_ot: x.day_type === "shift" ? x.is_ot : false,
          swapped: x.day_type === "shift" ? x.swapped : false,
          swapped_with: x.day_type === "shift" ? (x.swapped ? x.swapped_with : null) : null,
          note: x.note || null,
        };

        if (ex) {
          const { error } = await supabase.from("shifts_public").update(payload).eq("id", ex.id);
          if (error) throw error;
        } else {
          const { error } = await supabase.from("shifts_public").insert(payload);
          if (error) throw error;
        }
      }

      onSaved();
      onClose();
    } catch (e: any) {
      alert(e.message ?? "save error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white shadow-2xl max-h-[85vh] pb-[env(safe-area-inset-bottom)]">
        <div className="sticky top-0 z-10 rounded-t-3xl bg-white px-4 pt-3">
          <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-zinc-300" />

          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-base font-extrabold">{dateISO}</div>
              <div className="text-xs text-zinc-500">เลือกเฉพาะช่วงที่มีเวร</div>
            </div>
            <button
              onClick={onClose}
              className="rounded-2xl bg-zinc-100 px-3 py-2 text-sm font-semibold"
              type="button"
            >
              ปิด
            </button>
          </div>

          <div className="mt-3">
            <CenterMode value={allDayType} onChange={applyAllDay} />
          </div>

          <div className={clsx("mt-3", allDayType !== "shift" && "opacity-50 pointer-events-none")}>
            <Segmented value={active} onChange={setActive} />
          </div>
        </div>

        <div className="px-4 pb-4 pt-4 overflow-y-auto overscroll-contain touch-pan-y">
          {allDayType !== "shift" ? (
            <>
              <div className="text-sm font-semibold text-zinc-800">หมายเหตุ</div>
              <textarea
                value={drafts.morning.note}
                onChange={(e) => {
                  const v = e.target.value;
                  setDrafts((prev) => ({
                    ...prev,
                    morning: { ...prev.morning, note: v },
                    afternoon: { ...prev.afternoon, note: v },
                    night: { ...prev.night, note: v },
                  }));
                }}
                className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm"
                rows={3}
                placeholder="เช่น ลาป่วย / หยุดพัก / หมายเหตุเพิ่มเติม"
              />

              <div className="mt-5">
                <button
                  disabled={saving}
                  onClick={saveAll}
                  className={clsx(
                    "w-full rounded-2xl px-4 py-3 text-base font-extrabold",
                    saving ? "bg-zinc-300 text-zinc-700" : "bg-zinc-900 text-white"
                  )}
                  type="button"
                >
                  {saving ? "กำลังบันทึก..." : "บันทึก"}
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-zinc-800">
                  {periodLabel[active]}
                </div>

                <button
                  type="button"
                  onClick={toggleEnabled}
                  className={clsx(
                    "rounded-2xl px-3 py-2 text-sm font-extrabold transition",
                    d.enabled ? "bg-zinc-900 text-white" : "bg-zinc-100 text-zinc-700"
                  )}
                >
                  {d.enabled ? "เลือกแล้ว" : "เพิ่มเวร"}
                </button>
              </div>

              {!d.enabled ? (
                <div className="mt-3 rounded-2xl bg-zinc-100 p-3 text-sm text-zinc-600">
                  ยังไม่ได้เลือกช่วงนี้ — กด <span className="font-semibold">เพิ่มเวร</span> เพื่อใส่เวร
                </div>
              ) : (
                <>
                  <div className="mt-4 text-sm font-semibold text-zinc-800">สีเวร</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {colors.map((c) => (
                      <button
                        key={c}
                        type="button"
                        aria-label={`color-${c}`}
                        onClick={() => setDraft({ color: c })}
                        className={clsx(
                          "h-10 w-10 rounded-full shadow-sm transition active:scale-[0.98]",
                          colorSwatchClass[c],
                          d.color === c ? "ring-2 ring-zinc-900 ring-offset-2" : "ring-0"
                        )}
                      />
                    ))}
                  </div>

                  <div className="mt-4 flex items-center gap-2">
                    <IconToggle
                      active={d.is_ot}
                      onToggle={() => setDraft({ is_ot: !d.is_ot })}
                      icon="⏱"
                      ariaLabel="toggle-ot"
                    />
                    <IconToggle
                      active={d.swapped}
                      onToggle={() => setDraft({ swapped: !d.swapped })}
                      icon="↔"
                      ariaLabel="toggle-swapped"
                    />
                  </div>

                  {d.swapped && (
                    <div className="mt-3">
                      <input
                        value={d.swapped_with}
                        onChange={(e) => setDraft({ swapped_with: e.target.value })}
                        placeholder="สลับกับใคร / รายละเอียด"
                        className="w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm"
                      />
                    </div>
                  )}

                  <div className="mt-4">
                    <div className="text-sm font-semibold text-zinc-800">หมายเหตุ</div>
                    <textarea
                      value={d.note}
                      onChange={(e) => setDraft({ note: e.target.value })}
                      className="mt-2 w-full rounded-2xl border border-zinc-200 px-4 py-3 text-sm"
                      rows={3}
                      placeholder="เช่น ขอแลกเวร / รายละเอียดเพิ่มเติม"
                    />
                  </div>
                </>
              )}

              <div className="mt-5">
                <button
                  disabled={saving}
                  onClick={saveAll}
                  className={clsx(
                    "w-full rounded-2xl px-4 py-3 text-base font-extrabold",
                    saving ? "bg-zinc-300 text-zinc-700" : "bg-zinc-900 text-white"
                  )}
                  type="button"
                >
                  {saving ? "กำลังบันทึก..." : "บันทึก"}
                </button>
              </div>
            </>
          )}

          <div className="h-3" />
        </div>
      </div>
    </div>
  );
}
