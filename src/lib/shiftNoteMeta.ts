export type ShiftNoteMeta = {
  bought?: boolean;
  bought_from?: string;
  bought_price?: number;
  oncall?: boolean;
  swap_remark?: string;
  swap_direction?: "out" | "in";
};

const META_PREFIX = "<!--dc-meta:";
const META_SUFFIX = "-->";

function safeJsonParse(value: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseShiftNote(note: string | null | undefined): {
  text: string;
  meta: ShiftNoteMeta;
} {
  const raw = (note ?? "").trim();
  if (!raw) return { text: "", meta: {} };

  const idx = raw.lastIndexOf(META_PREFIX);
  if (idx === -1) return { text: raw, meta: {} };

  const endIdx = raw.indexOf(META_SUFFIX, idx);
  if (endIdx === -1) return { text: raw, meta: {} };

  const jsonPart = raw.slice(idx + META_PREFIX.length, endIdx).trim();
  const textPart = raw.slice(0, idx).trimEnd();

  const parsed = safeJsonParse(jsonPart);
  if (!isPlainObject(parsed)) return { text: textPart, meta: {} };

  const meta: ShiftNoteMeta = {};
  if (typeof parsed.bought === "boolean") meta.bought = parsed.bought;
  if (typeof parsed.bought_from === "string") meta.bought_from = parsed.bought_from;
  if (typeof parsed.bought_price === "number") meta.bought_price = parsed.bought_price;
  if (typeof parsed.oncall === "boolean") meta.oncall = parsed.oncall;
  if (typeof parsed.swap_remark === "string") meta.swap_remark = parsed.swap_remark;
  if (parsed.swap_direction === "out" || parsed.swap_direction === "in") {
    meta.swap_direction = parsed.swap_direction;
  }

  return { text: textPart, meta };
}

export function buildShiftNote(text: string, meta: ShiftNoteMeta): string | null {
  const cleanText = text.trim();

  const metaClean: ShiftNoteMeta = {
    bought: meta.bought ? true : undefined,
    bought_from: meta.bought_from?.trim() ? meta.bought_from.trim() : undefined,
    bought_price:
      typeof meta.bought_price === "number" && Number.isFinite(meta.bought_price)
        ? meta.bought_price
        : undefined,
    oncall: meta.oncall ? true : undefined,
    swap_remark: meta.swap_remark?.trim() ? meta.swap_remark.trim() : undefined,
    swap_direction:
      meta.swap_direction === "out" || meta.swap_direction === "in"
        ? meta.swap_direction
        : undefined,
  };

  const hasMeta = Object.values(metaClean).some((v) => v !== undefined);

  if (!cleanText && !hasMeta) return null;
  if (!hasMeta) return cleanText;

  return `${cleanText}\n${META_PREFIX}${JSON.stringify(metaClean)}${META_SUFFIX}`;
}
