"use client";

import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { CountdownSlot, CountdownSlotRow } from "@/lib/types";
import { CountdownSlotCard } from "./CountdownSlotCard";
import type { SlotDraft } from "./types";
import { computeProgress, defaultDraft, validateDraft } from "./utils";

const TABLE = "countdown_slots_public";
const ACTIVE_SLOT: CountdownSlot = 2;

export function CountdownSlots({ onChanged }: { onChanged?: () => void }) {
  const [rows, setRows] = useState<CountdownSlotRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  const [editingSlot, setEditingSlot] = useState<CountdownSlot | null>(null);
  const [menuSlot, setMenuSlot] = useState<CountdownSlot | null>(null);
  const [draft, setDraft] = useState<SlotDraft>(() => defaultDraft());
  const [saving, setSaving] = useState(false);

  const rootRef = useRef<HTMLDivElement | null>(null);

  const [todayISO, setTodayISO] = useState(() => dayjs().format("YYYY-MM-DD"));
  useEffect(() => {
    const id = window.setInterval(() => {
      setTodayISO(dayjs().format("YYYY-MM-DD"));
    }, 60_000);
    return () => window.clearInterval(id);
  }, []);

  const togetherDays = useMemo(() => {
    const start = dayjs("2025-12-15");
    const today = dayjs(todayISO);
    const diff = today.startOf("day").diff(start.startOf("day"), "day");
    return Math.max(0, diff + 1);
  }, [todayISO]);

  useEffect(() => {
    if (!menuSlot) return;

    const onPointerDown = (ev: PointerEvent) => {
      const t = ev.target as HTMLElement | null;
      if (!t) return;
      const root = rootRef.current;
      if (!root) return;

      const inside = t.closest(`[data-countdown-slot="${menuSlot}"]`);
      if (!inside) setMenuSlot(null);
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [menuSlot]);

  const bySlot = useMemo(() => {
    const map = new Map<CountdownSlot, CountdownSlotRow>();
    for (const r of rows) map.set(r.slot, r);
    return map;
  }, [rows]);

  const load = useCallback(async () => {
    setLoading(true);
    setErrorText(null);
    try {
      const { data, error } = await supabase
        .from(TABLE)
        .select("id, slot, title, start_date, target_date, created_at, updated_at")
        .eq("slot", ACTIVE_SLOT);

      if (error) throw error;
      setRows((data ?? []) as CountdownSlotRow[]);
    } catch (e: unknown) {
      console.error(e);
      setErrorText(e instanceof Error ? e.message : "โหลดข้อมูลไม่สำเร็จ");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const beginEdit = (slot: CountdownSlot) => {
    const existing = bySlot.get(slot);
    setEditingSlot(slot);
    setMenuSlot(null);
    if (existing) {
      setDraft({
        title: existing.title ?? "",
        start_date: existing.start_date,
        target_date: existing.target_date,
      });
    } else {
      setDraft(defaultDraft());
    }
    setErrorText(null);
  };

  const cancelEdit = () => {
    setEditingSlot(null);
    setDraft(defaultDraft());
    setErrorText(null);
  };

  const save = async () => {
    if (!editingSlot) return;

    const msg = validateDraft(draft);
    if (msg) {
      setErrorText(msg);
      return;
    }

    setSaving(true);
    setErrorText(null);
    try {
      const payload = {
        slot: editingSlot,
        title: draft.title.trim(),
        start_date: draft.start_date,
        target_date: draft.target_date,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from(TABLE).upsert(payload, { onConflict: "slot" });
      if (error) throw error;

      await load();
      cancelEdit();
      onChanged?.();
    } catch (e: unknown) {
      console.error(e);
      setErrorText(e instanceof Error ? e.message : "บันทึกไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const clearSlot = async (slot: CountdownSlot) => {
    const existing = bySlot.get(slot);
    if (!existing) return;

    setSaving(true);
    setErrorText(null);
    try {
      const { error } = await supabase.from(TABLE).delete().eq("id", existing.id);
      if (error) throw error;

      await load();
      if (editingSlot === slot) cancelEdit();
      onChanged?.();
    } catch (e: unknown) {
      console.error(e);
      setErrorText(e instanceof Error ? e.message : "ลบไม่สำเร็จ");
    } finally {
      setSaving(false);
    }
  };

  const row = bySlot.get(ACTIVE_SLOT);
  const stats =
    row?.start_date && row?.target_date
      ? computeProgress(todayISO, row.start_date, row.target_date)
      : null;

  return (
    <div ref={rootRef} className="space-y-1.5 min-[480px]:space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="text-base font-semibold text-zinc-900 dark:text-zinc-100 min-[480px]:text-lg">
          Countdown
        </div>
        <div className="whitespace-nowrap text-[10px] font-semibold text-zinc-500 dark:text-zinc-400 min-[480px]:text-xs">
          {togetherDays} days and still going 🤍
        </div>
      </div>

      <CountdownSlotCard
        slot={ACTIVE_SLOT}
        row={row}
        stats={stats}
        loading={loading}
        saving={saving}
        menuOpen={menuSlot === ACTIVE_SLOT}
        editing={editingSlot === ACTIVE_SLOT}
        draft={draft}
        setDraft={setDraft}
        errorText={errorText}
        onToggleMenu={() =>
          setMenuSlot((current) => (current === ACTIVE_SLOT ? null : ACTIVE_SLOT))
        }
        onBeginEdit={() => beginEdit(ACTIVE_SLOT)}
        onClear={() => void clearSlot(ACTIVE_SLOT)}
        onSave={() => void save()}
        onCancelEdit={cancelEdit}
      />
    </div>
  );
}
