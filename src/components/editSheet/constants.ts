import type { ShiftColor, ShiftPeriod } from "@/lib/types";

export const periods: ShiftPeriod[] = ["morning", "afternoon", "night"];
export const colors: ShiftColor[] = ["green", "blue", "yellow", "orange", "pink", "white"];

export const VACATION_TOTAL_DAYS = 7;
export const SOLD_PRICE_DEFAULT = 1200;
export const SOLD_PRICE_STEP = 100;

export const colorSwatchClass: Record<ShiftColor, string> = {
  green: "bg-green-500",
  blue: "bg-sky-500",
  yellow: "bg-yellow-300",
  orange: "bg-orange-500",
  pink: "bg-pink-500",
  white: "bg-white border border-zinc-300 dark:border-zinc-700",
  red: "bg-red-500",
};
