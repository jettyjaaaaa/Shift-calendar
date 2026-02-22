"use client";

import clsx from "clsx";
import Image from "next/image";
import type { CountdownSlot, CountdownSlotRow } from "@/lib/types";
import type { ProgressStats, SlotDraft } from "./types";
import { CountdownEditorPopover } from "./CountdownEditorPopover";
import { formatDDMMYYYY } from "./utils";

export function CountdownSlotCard({
  slot,
  row,
  stats,
  loading,
  saving,
  menuOpen,
  editing,
  draft,
  setDraft,
  errorText,
  onToggleMenu,
  onBeginEdit,
  onClear,
  onSave,
  onCancelEdit,
}: {
  slot: CountdownSlot;
  row: CountdownSlotRow | undefined;
  stats: ProgressStats | null;
  loading: boolean;
  saving: boolean;
  menuOpen: boolean;
  editing: boolean;
  draft: SlotDraft;
  setDraft: (updater: (prev: SlotDraft) => SlotDraft) => void;
  errorText: string | null;
  onToggleMenu: () => void;
  onBeginEdit: () => void;
  onClear: () => void;
  onSave: () => void;
  onCancelEdit: () => void;
}) {
  const configured = !!row;

  const title = row?.title ?? "ยังไม่ได้ตั้งค่า";
  const targetText = row?.target_date ? formatDDMMYYYY(row.target_date) : null;

  const remainingText = stats ? `เหลืออีก ${stats.remainDays} วันเอง` : "ยังไม่ได้ตั้งค่า";
  const pct = stats ? Math.round(stats.progress * 100) : 0;

  const fillClass =
    row?.start_date && row?.target_date
      ? slot === 1
        ? "bg-yellow-200"
        : "bg-pink-200"
      : "bg-zinc-300";

  const markerBorderClass = slot === 1 ? "border-yellow-300" : "border-pink-300";
  const markerImgSrc = slot === 1 ? "/images/jet.png" : "/images/view.png";

  const markerLeftPct = Math.min(100, Math.max(0, pct));

  return (
    <div
      data-countdown-slot={slot}
      className={clsx(
        "relative rounded-xl bg-white shadow-sm border border-zinc-100 min-[480px]:rounded-2xl",
        "px-2.5 py-2 min-[480px]:px-3 min-[480px]:py-3",
        "dark:bg-zinc-950 dark:border-zinc-800"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-baseline gap-2 min-w-0">
            <div className="truncate text-sm font-extrabold text-zinc-900 dark:text-zinc-100 min-[480px]:text-base">
              {title}
            </div>
            {targetText ? (
              <div className="shrink-0 text-[11px] text-zinc-500 dark:text-zinc-400">
                {targetText}
              </div>
            ) : null}
          </div>
          <div
            className={clsx(
              "mt-0.5 text-xs font-semibold min-[480px]:mt-1 min-[480px]:text-sm",
              stats ? "text-zinc-700 dark:text-zinc-300" : "text-zinc-400 dark:text-zinc-500"
            )}
          >
            {remainingText}
          </div>
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={onToggleMenu}
            className={clsx(
              "h-8 w-8 rounded-lg bg-zinc-100 text-zinc-800 min-[480px]:h-9 min-[480px]:w-9 min-[480px]:rounded-xl",
              "dark:bg-zinc-900 dark:text-zinc-100",
              "grid place-items-center",
              saving ? "opacity-60 pointer-events-none" : ""
            )}
            aria-label="menu"
          >
            <span className="text-lg leading-none">⋯</span>
          </button>

          {menuOpen ? (
            <div className="absolute right-0 mt-2 w-36 rounded-2xl bg-white shadow-sm border border-zinc-200 p-1 z-20 dark:bg-zinc-950 dark:border-zinc-800">
              <button
                type="button"
                onClick={onBeginEdit}
                className="w-full text-left text-sm px-3 py-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900"
                disabled={saving}
              >
                {configured ? "แก้ไข" : "เพิ่ม"}
              </button>
              {configured ? (
                <button
                  type="button"
                  onClick={onClear}
                  className="w-full text-left text-sm px-3 py-2 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900"
                  disabled={saving}
                >
                  ล้าง
                </button>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>

      <div className="relative mt-2">
        <div className="h-2 w-full rounded-full bg-zinc-200 overflow-hidden dark:bg-zinc-800">
          <div
            className={clsx("h-full rounded-full", fillClass, "transition-[width] duration-300")}
            style={{ width: `${pct}%` }}
          />
        </div>

        {stats ? (
          <div
            className={clsx(
              "absolute top-1/2 -translate-y-1/2 h-5 w-5 rounded-full border overflow-hidden z-10 pointer-events-none",
              "bg-white dark:bg-zinc-950",
              markerBorderClass
            )}
            style={{ left: `calc(${markerLeftPct}% - 10px)` }}
            aria-hidden="true"
          >
            <Image
              src={markerImgSrc}
              alt=""
              width={20}
              height={20}
              sizes="20px"
              className="h-full w-full object-cover"
              draggable={false}
            />
          </div>
        ) : null}
      </div>

      <CountdownEditorPopover
        open={editing}
        draft={draft}
        setDraft={setDraft}
        saving={saving}
        errorText={errorText}
        onSave={onSave}
        onCancel={onCancelEdit}
      />

      {loading ? <div className="mt-1 text-[11px] text-zinc-400">กำลังโหลด…</div> : null}
    </div>
  );
}
