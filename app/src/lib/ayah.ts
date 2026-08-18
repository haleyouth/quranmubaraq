/**
 * Daily ayah.
 *
 * Source: AlQuran Cloud (api.alquran.cloud), a long-running free API serving
 * the Uthmani script and the Sahih International translation. It sends
 * `Access-Control-Allow-Origin: *`, so the browser can fetch it directly and
 * the site stays a static export.
 *
 * The ayah is chosen from a curated list rather than at random across all
 * 6,236 verses: an academy homepage should not surface a verse of legal
 * detail or admonition without context. Every entry below is a well-known
 * verse of remembrance, mercy or encouragement.
 *
 * If the API is unreachable the same verse still renders from the bundled
 * text, so the panel never shows a failure state to a visitor.
 */

export type Ayah = {
  /** Global ayah number, 1-6236. Verified against the API. */
  number: number;
  arabic: string;
  english: string;
  surahName: string;
  surahEnglish: string;
  surahNumber: number;
  numberInSurah: number;
  /** True when the bundled copy was used because the API was unreachable. */
  offline?: boolean;
};

/**
 * Curated verses, with their bundled text used as the offline fallback.
 * Arabic is Uthmani script; English is Sahih International, matching the
 * editions requested from the API so online and offline text agree.
 */
const CURATED: readonly Ayah[] = [
  {
    number: 262, surahNumber: 2, numberInSurah: 255,
    surahName: "البقرة", surahEnglish: "Al-Baqarah",
    arabic:
      "ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌۭ وَلَا نَوْمٌۭ",
    english:
      "Allah — there is no deity except Him, the Ever-Living, the Sustainer of all existence. Neither drowsiness overtakes Him nor sleep.",
  },
  {
    number: 293, surahNumber: 2, numberInSurah: 286,
    surahName: "البقرة", surahEnglish: "Al-Baqarah",
    arabic: "لَا يُكَلِّفُ ٱللَّهُ نَفْسًا إِلَّا وُسْعَهَا",
    english: "Allah does not charge a soul except with that within its capacity.",
  },
  {
    number: 1811, surahNumber: 15, numberInSurah: 9,
    surahName: "الحجر", surahEnglish: "Al-Hijr",
    arabic: "إِنَّا نَحْنُ نَزَّلْنَا ٱلذِّكْرَ وَإِنَّا لَهُۥ لَحَٰفِظُونَ",
    english:
      "Indeed, it is We who sent down the Qur'an and indeed, We will be its guardian.",
  },
  {
    number: 4863, surahNumber: 54, numberInSurah: 17,
    surahName: "القمر", surahEnglish: "Al-Qamar",
    arabic: "وَلَقَدْ يَسَّرْنَا ٱلْقُرْءَانَ لِلذِّكْرِ فَهَلْ مِن مُّدَّكِرٍۢ",
    english:
      "And We have certainly made the Qur'an easy for remembrance, so is there any who will remember?",
  },
  {
    number: 6096, surahNumber: 94, numberInSurah: 6,
    surahName: "الشرح", surahEnglish: "Ash-Sharh",
    arabic: "إِنَّ مَعَ ٱلْعُسْرِ يُسْرًۭا",
    english: "Indeed, with hardship will be ease.",
  },
  {
    number: 2929, surahNumber: 25, numberInSurah: 74,
    surahName: "الفرقان", surahEnglish: "Al-Furqan",
    arabic: "وَٱجْعَلْنَا لِلْمُتَّقِينَ إِمَامًۭا",
    english: "And make us an example for the righteous.",
  },
  {
    number: 2029, surahNumber: 16, numberInSurah: 128,
    surahName: "النحل", surahEnglish: "An-Nahl",
    arabic: "إِنَّ ٱللَّهَ مَعَ ٱلَّذِينَ ٱتَّقَوا۟ وَّٱلَّذِينَ هُم مُّحْسِنُونَ",
    english:
      "Indeed, Allah is with those who fear Him and those who are doers of good.",
  },
  {
    number: 3409, surahNumber: 29, numberInSurah: 69,
    surahName: "العنكبوت", surahEnglish: "Al-'Ankabut",
    arabic: "وَٱلَّذِينَ جَٰهَدُوا۟ فِينَا لَنَهْدِيَنَّهُمْ سُبُلَنَا",
    english:
      "And those who strive for Us — We will surely guide them to Our ways.",
  },
  {
    number: 5115, surahNumber: 58, numberInSurah: 11,
    surahName: "المجادلة", surahEnglish: "Al-Mujadila",
    arabic:
      "يَرْفَعِ ٱللَّهُ ٱلَّذِينَ ءَامَنُوا۟ مِنكُمْ وَٱلَّذِينَ أُوتُوا۟ ٱلْعِلْمَ دَرَجَٰتٍۢ",
    english:
      "Allah will raise those who have believed among you and those who were given knowledge, by degrees.",
  },
  {
    number: 3012, surahNumber: 26, numberInSurah: 80,
    surahName: "الشعراء", surahEnglish: "Ash-Shu'ara",
    arabic: "وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ",
    english: "And when I am ill, it is He who cures me.",
  },
  {
    number: 1561, surahNumber: 11, numberInSurah: 88,
    surahName: "هود", surahEnglish: "Hud",
    arabic: "وَمَا تَوْفِيقِىٓ إِلَّا بِٱللَّهِ ۚ عَلَيْهِ تَوَكَّلْتُ",
    english:
      "And my success is not but through Allah. Upon Him I have relied.",
  },
  {
    number: 2462, surahNumber: 20, numberInSurah: 114,
    surahName: "طه", surahEnglish: "Ta-Ha",
    arabic: "وَقُل رَّبِّ زِدْنِى عِلْمًۭا",
    english: "And say: My Lord, increase me in knowledge.",
  },
  {
    number: 1757, surahNumber: 14, numberInSurah: 7,
    surahName: "إبراهيم", surahEnglish: "Ibrahim",
    arabic: "لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ",
    english: "If you are grateful, I will surely increase you in favour.",
  },
  {
    number: 1158, surahNumber: 7, numberInSurah: 204,
    surahName: "الأعراف", surahEnglish: "Al-A'raf",
    arabic:
      "وَإِذَا قُرِئَ ٱلْقُرْءَانُ فَٱسْتَمِعُوا۟ لَهُۥ وَأَنصِتُوا۟ لَعَلَّكُمْ تُرْحَمُونَ",
    english:
      "So when the Qur'an is recited, then listen to it and pay attention that you may receive mercy.",
  },
] as const;

/**
 * Picks today's verse deterministically from the date, so everyone viewing on
 * the same day sees the same ayah, and it changes at local midnight.
 */
export function ayahOfTheDay(date = new Date()): Ayah {
  const dayIndex = Math.floor(
    new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime() / 86400000,
  );
  return CURATED[Math.abs(dayIndex) % CURATED.length];
}

const API = "https://api.alquran.cloud/v1/ayah";

/**
 * Fetches today's verse from AlQuran Cloud, falling back to the bundled text.
 * Never throws — the caller always receives a renderable ayah.
 */
export async function fetchAyahOfTheDay(date = new Date()): Promise<Ayah> {
  const local = ayahOfTheDay(date);

  try {
    const ref = `${local.surahNumber}:${local.numberInSurah}`;
    const res = await fetch(`${API}/${ref}/editions/quran-uthmani,en.sahih`, {
      signal: AbortSignal.timeout(6000),
    });
    if (!res.ok) throw new Error(String(res.status));

    const json = (await res.json()) as {
      code: number;
      data: {
        text: string;
        numberInSurah: number;
        surah: { number: number; name: string; englishName: string };
        edition: { identifier: string };
      }[];
    };
    if (json.code !== 200 || !Array.isArray(json.data) || json.data.length < 2) {
      throw new Error("unexpected payload");
    }

    const arabic = json.data.find((d) => d.edition.identifier === "quran-uthmani");
    const english = json.data.find((d) => d.edition.identifier === "en.sahih");
    if (!arabic || !english) throw new Error("missing edition");

    return {
      number: local.number,
      arabic: arabic.text,
      english: english.text,
      surahName: arabic.surah.name,
      surahEnglish: arabic.surah.englishName,
      surahNumber: arabic.surah.number,
      numberInSurah: arabic.numberInSurah,
    };
  } catch {
    // Offline, blocked, or slow — the bundled text is already correct
    return { ...local, offline: true };
  }
}
