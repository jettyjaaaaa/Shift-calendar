export type LeaveKind = "vacation" | "other" | null;

export type ShiftPeriod = "morning" | "afternoon" | "night";
export type DayType = "shift" | "off" | "leave";

export type ShiftColor = "green" | "blue" | "yellow" | "orange" | "pink" | "white" | "red";

export type ShiftRow = {
  id: number;
  work_date: string;
  period: ShiftPeriod;
  day_type: DayType;
  color: ShiftColor | null;

  is_ot: boolean;
  swapped: boolean;
  swapped_with: string | null;
  note: string | null;

  sold: boolean;
  sold_to: string | null;
  sold_price: number | null;
  leave_kind: LeaveKind;
};
