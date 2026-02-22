import type { ShiftColor } from "@/lib/types";

export type Draft = {
  enabled: boolean;
  color: ShiftColor | null;
  is_ot: boolean;
  oncall: boolean;
  swapped: boolean;
  swapped_with: string;
  swap_remark: string;
  swap_direction: "out" | "in";
  sold: boolean;
  sold_to: string;
  sold_price: number;
  bought: boolean;
  bought_from: string;
  bought_price: number;
  note: string;
};
