"use client";

import clsx from "clsx";
import type { SlotDraft } from "./types";

export function CountdownEditorPopover({
  open,
  draft,
  setDraft,
  saving,
  errorText,
  onSave,
  onCancel,
}: {
  open: boolean;
  draft: SlotDraft;
  setDraft: (updater: (prev: SlotDraft) => SlotDraft) => void;
  saving: boolean;
  errorText: string | null;
  onSave: () => void;
  onCancel: () => void;
}) {
  if (!open) return null;

  return (
    <div className="absolute left-0 right-0 top-12 z-30 px-3">
      <div className="rounded-2xl bg-white shadow-sm border border-zinc-200 p-3 dark:bg-zinc-950 dark:border-zinc-800">
        <div className="grid gap-2">
          <input
            value={draft.title}
            onChange={(e) => setDraft((p) => ({ ...p, title: e.target.value }))}
            placeholder="ชื่อหลอด เช่น เจอกันอีกครั้ง"
            className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
          />

          <div className="grid grid-cols-2 gap-2">
            <label className="grid gap-1">
              <div className="text-[11px] text-zinc-500">วันเริ่ม</div>
              <input
                type="date"
                value={draft.start_date}
                onChange={(e) => setDraft((p) => ({ ...p, start_date: e.target.value }))}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </label>

            <label className="grid gap-1">
              <div className="text-[11px] text-zinc-500">วัน target</div>
              <input
                type="date"
                value={draft.target_date}
                onChange={(e) => setDraft((p) => ({ ...p, target_date: e.target.value }))}
                    className="w-full rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-100"
              />
            </label>
          </div>

          {errorText ? <div className="text-xs text-red-600">{errorText}</div> : null}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onSave}
              className={clsx(
                "flex-1 rounded-2xl px-4 py-3 text-sm font-extrabold",
                "bg-zinc-900 text-white",
                saving ? "opacity-70" : ""
              )}
              disabled={saving}
            >
              {saving ? "กำลังบันทึก..." : "บันทึก"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className={clsx(
                "flex-1 rounded-2xl px-4 py-3 text-sm font-extrabold",
                "bg-zinc-100 text-zinc-700",
                saving ? "opacity-70" : ""
              )}
              disabled={saving}
            >
              ยกเลิก
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
