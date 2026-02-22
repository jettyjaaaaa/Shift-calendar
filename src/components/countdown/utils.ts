import dayjs from "dayjs";
import type { ProgressStats, SlotDraft } from "./types";

function clamp01(n: number) {
  if (Number.isNaN(n)) return 0;
  return Math.min(1, Math.max(0, n));
}

export function computeProgress(todayISO: string, startISO: string, targetISO: string): ProgressStats {
  const today = dayjs(todayISO);
  const start = dayjs(startISO);
  const target = dayjs(targetISO);

  if (!today.isValid() || !start.isValid() || !target.isValid()) {
    return { progress: 0, totalDays: 0, doneDays: 0, remainDays: 0 };
  }

  const totalDays = Math.max(0, target.startOf("day").diff(start.startOf("day"), "day"));
  const doneDays = Math.max(0, today.startOf("day").diff(start.startOf("day"), "day"));
  const remainDays = Math.max(0, target.startOf("day").diff(today.startOf("day"), "day"));

  const progress = totalDays === 0 ? (today.isBefore(target) ? 0 : 1) : clamp01(doneDays / totalDays);

  return {
    progress,
    totalDays,
    doneDays: Math.min(doneDays, totalDays),
    remainDays,
  };
}

export function defaultDraft(): SlotDraft {
  const today = dayjs().format("YYYY-MM-DD");
  return {
    title: "",
    start_date: today,
    target_date: today,
  };
}

export function formatDDMMYYYY(iso: string) {
  const d = dayjs(iso);
  return d.isValid() ? d.format("DD/MM/YYYY") : iso;
}

export function validateDraft(d: SlotDraft) {
  if (!d.title.trim()) return "กรอกชื่อหลอด";
  if (!d.start_date) return "เลือกวันเริ่ม";
  if (!d.target_date) return "เลือกวัน target";
  if (dayjs(d.target_date).isBefore(dayjs(d.start_date), "day")) {
    return "วัน target ต้องไม่ก่อนวันเริ่ม";
  }
  return null;
}
