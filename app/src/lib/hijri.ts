/**
 * Hijri (Islamic) date conversion.
 *
 * Uses the Umm al-Qura tabular algorithm via Intl's islamic-umalqura
 * calendar where available, with an arithmetic fallback for older engines.
 * Tabular calendars can differ by a day from local moon sighting — the UI
 * says so rather than implying certainty.
 */

export const HIJRI_MONTHS = [
  "Muharram", "Safar", "Rabi' al-Awwal", "Rabi' al-Thani",
  "Jumada al-Ula", "Jumada al-Akhirah", "Rajab", "Sha'ban",
  "Ramadan", "Shawwal", "Dhu al-Qi'dah", "Dhu al-Hijjah",
] as const;

export type HijriDate = { day: number; month: number; year: number; monthName: string };

export function toHijri(date: Date): HijriDate {
  try {
    const fmt = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura-nu-latn", {
      day: "numeric",
      month: "numeric",
      year: "numeric",
      timeZone: "UTC",
    });

    const parts = fmt.formatToParts(date);
    const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0);

    const day = get("day");
    const month = get("month");
    const year = get("year");

    if (day && month && year) {
      return { day, month, year, monthName: HIJRI_MONTHS[month - 1] ?? "" };
    }
  } catch {
    // fall through to the arithmetic conversion
  }

  return arithmeticHijri(date);
}

/** Kuwaiti algorithm — accurate to within a day, used only as a fallback. */
function arithmeticHijri(date: Date): HijriDate {
  const jd =
    Math.floor((date.getTime() - date.getTimezoneOffset() * 60000) / 86400000) +
    2440588;

  const l0 = jd - 1948440 + 10632;
  const n = Math.floor((l0 - 1) / 10631);
  let l = l0 - 10631 * n + 354;
  const j =
    Math.floor((10985 - l) / 5316) * Math.floor((50 * l) / 17719) +
    Math.floor(l / 5670) * Math.floor((43 * l) / 15238);
  l =
    l -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;

  const month = Math.floor((24 * l) / 709);
  const day = l - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;

  return { day, month, year, monthName: HIJRI_MONTHS[month - 1] ?? "" };
}

export function formatHijri(d: HijriDate): string {
  return `${d.day} ${d.monthName} ${d.year} AH`;
}

/* -------------------------------------------------------------------------- */
/*                          Hijri -> Gregorian                                */
/* -------------------------------------------------------------------------- */

/**
 * Converts a Hijri date to Gregorian by searching outward from an estimate.
 *
 * Intl converts one way only, so the inverse is found by probing candidate
 * days around the arithmetic approximation until toHijri() agrees. The Hijri
 * year is ~354.367 days, which gives an estimate accurate to within days.
 */
export function fromHijri(hy: number, hm: number, hd: number): Date {
  const HIJRI_EPOCH_MS = Date.UTC(622, 6, 19);
  const daysSinceEpoch = (hy - 1) * 354.367 + (hm - 1) * 29.531 + (hd - 1);
  const estimate = new Date(HIJRI_EPOCH_MS + daysSinceEpoch * 86400000);
  estimate.setHours(12, 0, 0, 0);

  for (let offset = 0; offset <= 15; offset++) {
    for (const dir of offset === 0 ? [0] : [-1, 1]) {
      const probe = new Date(estimate);
      probe.setDate(probe.getDate() + offset * dir);
      const h = toHijri(probe);
      if (h.year === hy && h.month === hm && h.day === hd) {
        probe.setHours(0, 0, 0, 0);
        return probe;
      }
    }
  }

  estimate.setHours(0, 0, 0, 0);
  return estimate;
}

/** Number of days in a Hijri month — 29 or 30, determined by conversion. */
export function hijriMonthLength(hy: number, hm: number): number {
  const start = fromHijri(hy, hm, 1);
  let ny = hy;
  let nm = hm + 1;
  if (nm > 12) { nm = 1; ny += 1; }
  const nextStart = fromHijri(ny, nm, 1);
  const days = Math.round((nextStart.getTime() - start.getTime()) / 86400000);
  return days === 29 || days === 30 ? days : 30;
}
