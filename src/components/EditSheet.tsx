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
      next[p] = {
        enabled: !!ex || detected.size === 0,
        color: ex?.color ?? defaultColor,
        is_ot: ex?.is_ot ?? false,
        oncall: !!meta.oncall,
        swapped: ex?.swapped ?? false,
        swapped_with: ex?.swapped_with ?? "",
        swap_remark: meta.swap_remark ?? "",
        sold: ex?.sold ?? false,
        sold_to: ex?.sold_to ?? "",
        sold_price: ex?.sold_price ?? SOLD_PRICE_DEFAULT,
        bought: !!meta.bought,
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
          swap_remark: x.swap_remark,
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
      {" "}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl bg-white text-zinc-900 shadow-2xl max-h-[85vh] pb-[env(safe-area-inset-bottom)] dark:bg-zinc-950 dark:text-zinc-100">
        <div className="px-4 pt-4 pb-3">
          <div className="text-lg font-bold">{dateISO}</div>

          <CenterMode value={allDayType} onChange={setAllDayType} />
          {allDayType === "shift" && <Segmented value={active} onChange={setActive} />}
        </div>

        <div className="px-4 pb-6">
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

          <button
            type="button"
            disabled={saving}
            onClick={saveAll}
            className={clsx(
              "mt-6 w-full py-4 rounded-2xl font-bold",
              saving
                ? "bg-zinc-400 text-white dark:bg-zinc-700"
                : "bg-black text-white dark:bg-zinc-100 dark:text-zinc-900"
            )}
          >
            บันทึก
          </button>
        </div>
      </div>
    </div>
  );
}
