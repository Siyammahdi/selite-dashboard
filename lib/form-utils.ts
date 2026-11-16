export function todayInputValue(date?: Date) {
  const value = date ?? new Date();
  const y = value.getFullYear();
  const m = String(value.getMonth() + 1).padStart(2, "0");
  const d = String(value.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function isoFromDateInput(value: string) {
  if (!value) return new Date().toISOString();
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y!, (m ?? 1) - 1, d ?? 1, 12, 0, 0).toISOString();
}

export function dateInputFromIso(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return todayInputValue();
  return todayInputValue(date);
}

export function displayDateFromInput(value: string) {
  if (!value) {
    return new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y!, (m ?? 1) - 1, d ?? 1).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/** Parse `16 Nov 2026` / ISO / yyyy-mm-dd into an input value. */
export function dateInputFromDisplay(value: string) {
  if (!value) return todayInputValue();
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const iso = Date.parse(value);
  if (!Number.isNaN(iso)) return todayInputValue(new Date(iso));
  const match = value.match(/^(\d{1,2})\s+([A-Za-z]{3})\s+(\d{4})$/);
  if (!match) return todayInputValue();
  const months: Record<string, number> = {
    Jan: 0,
    Feb: 1,
    Mar: 2,
    Apr: 3,
    May: 4,
    Jun: 5,
    Jul: 6,
    Aug: 7,
    Sep: 8,
    Oct: 9,
    Nov: 10,
    Dec: 11,
  };
  const month = months[match[2]!];
  if (month == null) return todayInputValue();
  return todayInputValue(new Date(Number(match[3]), month, Number(match[1])));
}

export function parseMoney(value: string | number) {
  const n = typeof value === "number" ? value : Number(String(value).replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 64);
}
