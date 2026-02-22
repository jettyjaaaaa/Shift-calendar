"use client";

import type { Dayjs } from "dayjs";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { ShiftRow } from "@/lib/types";

const monthCache = new Map<string, ShiftRow[]>();
const SHIFT_COLUMNS =
  "id, work_date, period, day_type, color, is_ot, swapped, swapped_with, note, sold, sold_to, sold_price, leave_kind";

async function fetchMonth(month: Dayjs) {
  const key = month.format("YYYY-MM");
  const { data, error } = await supabase
    .from("shifts_public")
    .select(SHIFT_COLUMNS)
    .gte("work_date", month.startOf("month").format("YYYY-MM-DD"))
    .lte("work_date", month.endOf("month").format("YYYY-MM-DD"))
    .order("work_date", { ascending: true });

  if (error) throw error;
  const rows = (data ?? []) as ShiftRow[];
  monthCache.set(key, rows);
  return rows;
}

export function useMonthlyShifts({
  month,
  enabled,
  refreshKey,
}: {
  month: Dayjs;
  enabled: boolean;
  refreshKey: number;
}) {
  const key = month.format("YYYY-MM");
  const [rows, setRows] = useState<ShiftRow[]>(() => monthCache.get(key) ?? []);
  const [loading, setLoading] = useState(!monthCache.has(key));
  const [error, setError] = useState(false);
  const previousRefreshKey = useRef(refreshKey);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;
    const forceRefresh = previousRefreshKey.current !== refreshKey;
    previousRefreshKey.current = refreshKey;
    if (forceRefresh) monthCache.delete(key);
    const cached = monthCache.get(key);

    if (cached) {
      setRows(cached);
      setLoading(false);
      setError(false);
    } else {
      setLoading(true);
      setError(false);
      void fetchMonth(month)
        .then((nextRows) => {
          if (!cancelled) setRows(nextRows);
        })
        .catch((fetchError: unknown) => {
          console.error(fetchError);
          if (!cancelled) {
            setRows([]);
            setError(true);
          }
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }

    return () => {
      cancelled = true;
    };
  }, [enabled, key, month, refreshKey]);

  useEffect(() => {
    if (!enabled || loading || error) return;

    const warmAdjacentMonths = () => {
      for (const adjacent of [month.subtract(1, "month"), month.add(1, "month")]) {
        if (!monthCache.has(adjacent.format("YYYY-MM"))) void fetchMonth(adjacent).catch(() => {});
      }
    };

    if ("requestIdleCallback" in window) {
      const idleId = window.requestIdleCallback(warmAdjacentMonths, { timeout: 1500 });
      return () => window.cancelIdleCallback(idleId);
    }

    const timeoutId = globalThis.setTimeout(warmAdjacentMonths, 400);
    return () => globalThis.clearTimeout(timeoutId);
  }, [enabled, error, loading, month]);

  return { rows, loading, error };
}
