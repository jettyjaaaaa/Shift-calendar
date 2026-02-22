"use client";

import clsx from "clsx";
import { useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { supabase } from "@/lib/supabaseClient";
import { DayType, LeaveKind, ShiftColor, ShiftPeriod, ShiftRow } from "@/lib/types";
import { buildShiftNote, parseShiftNote, ShiftNoteMeta } from "@/lib/shiftNoteMeta";
import { CenterMode } from "@/components/editSheet/CenterMode";
import { LeaveSection } from "@/components/editSheet/LeaveSection";
import { Segmented } from "@/components/editSheet/Segmented";
import { ShiftSection } from "@/components/editSheet/ShiftSection";
import type { Draft } from "@/components/editSheet/types";
import { periods, SOLD_PRICE_DEFAULT } from "@/components/editSheet/constants";

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
      oncall: false,
      swapped: false,
      swapped_with: "",
      swap_remark: "",
      swap_direction: "out",
      sold: false,
      sold_to: "",
      sold_price: SOLD_PRICE_DEFAULT,
      bought: false,
      bought_from: "",
      bought_price: SOLD_PRICE_DEFAULT,
      note: "",
    },
    afternoon: {
      enabled: true,
      color: "blue",
      is_ot: false,
      oncall: false,
      swapped: false,
      swapped_with: "",
      swap_remark: "",
      swap_direction: "out",
      sold: false,
      sold_to: "",
      sold_price: SOLD_PRICE_DEFAULT,
      bought: false,
      bought_from: "",
      bought_price: SOLD_PRICE_DEFAULT,
      note: "",
    },
    night: {
      enabled: true,
      color: "yellow",
      is_ot: false,
      oncall: false,
      swapped: false,
      swapped_with: "",
      swap_remark: "",
      swap_direction: "out",
      sold: false,
      sold_to: "",
      sold_price: SOLD_PRICE_DEFAULT,
      bought: false,
      bought_from: "",
      bought_price: SOLD_PRICE_DEFAULT,
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

      const parsed = parseShiftNote(ex?.note);
      const meta = parsed.meta;
      const swapped = ex?.swapped ?? false;
      next[p] = {
        enabled: !!ex || detected.size === 0,
        color: ex?.color ?? defaultColor,
        is_ot: ex?.is_ot ?? false,
        oncall: !!meta.oncall,
        swapped,
        swapped_with: ex?.swapped_with ?? "",
        swap_remark: meta.swap_remark ?? "",
        swap_direction: meta.swap_direction ?? "out",
        sold: swapped ? false : (ex?.sold ?? false),
        sold_to: ex?.sold_to ?? "",
        sold_price: ex?.sold_price ?? SOLD_PRICE_DEFAULT,
        bought: swapped ? false : !!meta.bought,
        bought_from: meta.bought_from ?? "",
        bought_price: meta.bought_price ?? SOLD_PRICE_DEFAULT,
        note: parsed.text ?? "",
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

  const activeDraft = drafts[active];
  const formattedDate = new Intl.DateTimeFormat("th-TH", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(dayjs(dateISO).toDate());

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

        const meta: ShiftNoteMeta = {
          bought: x.bought,
          bought_from: x.bought_from,
          bought_price: x.bought_price,
          oncall: x.oncall,
          swap_remark: undefined,
          swap_direction: x.swapped ? x.swap_direction : undefined,
        };

        const payload = {
          work_date: dateISO,
          period: p,
          day_type: allDayType,
          color: isShift ? (x.oncall ? "red" : x.color) : null,
          is_ot: isShift ? (x.oncall ? true : x.is_ot) : false,
          swapped: isShift ? x.swapped : false,
          swapped_with: isShift && x.swapped ? x.swapped_with || null : null,
          sold: isShift ? x.sold : false,
          sold_to: isShift && x.sold ? x.sold_to || null : null,
          sold_price: isShift && x.sold ? x.sold_price || SOLD_PRICE_DEFAULT : 0,
          note: buildShiftNote(x.note, meta),
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
      <div className="absolute inset-0 bg-zinc-950/45 backdrop-blur-[2px]" onClick={onClose} />
      <div className="absolute inset-x-0 bottom-0 mx-auto flex max-h-[92dvh] max-w-[640px] flex-col overflow-hidden rounded-t-[30px] border border-white/70 bg-[#fffdf7] text-zinc-900 shadow-[0_-24px_70px_-24px_rgba(0,0,0,0.45)] pb-[env(safe-area-inset-bottom)] dark:border-white/10 dark:bg-zinc-950 dark:text-zinc-100 min-[640px]:bottom-4 min-[640px]:rounded-[30px]">
        <div className="shrink-0 border-b border-amber-100 bg-white/85 px-4 pb-4 pt-2 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/90 sm:px-5">
          <div className="mx-auto mb-2 h-1.5 w-12 rounded-full bg-zinc-300 dark:bg-zinc-700" />
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-amber-600">
                จัดการตารางเวร
              </div>
              <div className="mt-0.5 text-lg font-black leading-tight">{formattedDate}</div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-zinc-100 text-xl text-zinc-600 transition active:scale-95 dark:bg-zinc-900 dark:text-zinc-300"
              aria-label="ปิด"
            >
              ×
            </button>
          </div>

          <CenterMode value={allDayType} onChange={setAllDayType} />
          {allDayType === "shift" && <Segmented value={active} onChange={setActive} />}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-3 pt-1 sm:px-5">
          {allDayType === "leave" && (
            <LeaveSection
              leaveKind={leaveKind}
              setLeaveKind={setLeaveKind}
              vacationRemain={vacationRemain}
            />
          )}

          {allDayType === "shift" && (
            <ShiftSection active={active} draft={activeDraft} setDraft={setDraft} />
          )}
        </div>

        <div className="shrink-0 border-t border-zinc-200 bg-white/95 px-4 pb-3 pt-3 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/95 sm:px-5">
          <button
            type="button"
            disabled={saving}
            onClick={saveAll}
            className={clsx(
              "w-full rounded-2xl py-3.5 text-base font-black shadow-lg transition active:scale-[0.99]",
              saving
                ? "bg-zinc-400 text-white dark:bg-zinc-700"
                : "bg-amber-400 text-amber-950 shadow-amber-200/70 dark:bg-amber-400 dark:text-amber-950 dark:shadow-none"
            )}
          >
            {saving ? "กำลังบันทึก…" : "บันทึกตารางเวร"}
          </button>
        </div>
      </div>
    </div>
  );
}
