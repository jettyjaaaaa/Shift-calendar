export type ShiftPeriod = "morning" | "afternoon" | "night";
export type ShiftColor = "green" | "blue" | "yellow" | "orange" | "pink" | "white";
export type DayType = "shift" | "off" | "leave";

export type ShiftRow = {
  id: string;
  user_id: string;
  work_date: string; // YYYY-MM-DD
  period: ShiftPeriod;
  day_type: DayType;
  color: ShiftColor | null;
  is_ot: boolean;
  swapped: boolean;
  swapped_with: string | null;
  note: string | null;
  created_at: string;
  updated_at: string;
};
