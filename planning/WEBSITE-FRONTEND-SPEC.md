# Quran Mubarak — Public Website Frontend Spec
## Replica of quranmubarak.com in the summercamp.amaujunior.com design language

| | |
|---|---|
| **Source content** | quranmubarak.com (structure, copy, courses, fees) |
| **Source styling** | summercamp.amaujunior.com (design tokens, extracted verbatim) |
| **Build target** | `app/` — Next.js 15 + Tailwind v4 |
| **Companion doc** | [CRM-IMPLEMENTATION-PLAN.md](CRM-IMPLEMENTATION-PLAN.md) |
| **Date** | 17 August 2026 |

---

## 1. Security Finding (Action Required)

The live `quranmubarak.com` WordPress site is **compromised with SEO link-injection malware**. The rendered HTML contains ~28 hidden spam backlinks placed *before* the legitimate navigation, pointing to gambling domains:

```
melbet / мелбет  (prokgkr.ru, hotelluber.ru, permanentexpert.ru,
                  melbet-zerkalo-vhod.ru, melbet-zerklo.ru, vashstoma.ru)
1xbet            (1xbet-betvn.com, 1xbet-link.app, 1xbet-linkvao.com,
                  1xbet-link.live, azonindustrial.com/tr, 1xbetmobileaz.com,
                  1-x.bet, avi-med.kz, medicon.kz, 1xbet-thaibets.com)
others           (78win, w69-slot, ufa555, happyluke, playdoit,
                  aviator-az, aviator-demo, 888starz, pinco-az, betandreas7kaz)
```

**Impact:** Google penalties for linking to gambling/spam networks, brand-safety damage for an Islamic education institution, and evidence of an active compromise (vulnerable plugin, theme, or admin credential).

**Recommendation — independent of this rebuild:**
1. Take a full backup, then scan with Wordfence/Sucuri.
2. Rotate all WordPress, hosting, FTP and database credentials.
3. Patch or remove the vulnerable plugin/theme; audit for backdoor PHP files.
4. Submit a reconsideration request in Google Search Console once clean.

The rebuild in `app/` is a clean-room implementation and carries none of this. **Do not migrate the existing theme or plugins.**

---

## 2. Content Inventory (transcribed from source)

### 2.1 Navigation
`Home · Courses · About us · Fees Structure · Downloads · Blog · Contact Us`

Header utility bar: phone `0345-5997954`, email, social (Facebook, Twitter, YouTube, Skype).
Added for the new build: **Sign In** and **Register** actions linking to the portal.

### 2.2 Hero
- Headline: **"Start Learning QURAN In 3 Easy Steps"**
- Three steps: **1 Free Register** (Fill the form) · **2 Trial Classes** (Start free class) · **3 Enroll Today** (Take full course)
- Site title: *Quran Mubarak – The Islamic Center*

### 2.3 Registration Form
Fields: Full name · Email Address · Phone Number · Country (200+ dropdown).
Heading: **"Sign Up for a Free Trial Today"**

### 2.4 About
- Tagline: **"Start with the Name of Allah"**
- **"Welcome to Quran Mubarak"**
- **"Islamic Center for Muslims to Achieve Spiritual Goals"**
- "One of the top listed Online Islamic education Academy in the World with great customer satisfaction."
- Mission: "To teach Quran and other Islamic education in easy and simple ways."
- "Founded by Qasim Shafiq Mir in 2011 with 10 years of success."
- Positioning line: "The Original Online Quran Tutoring Service."

### 2.5 Courses — "Courses We Offer"

| Course | Description (verbatim) | Daily | Duration |
|---|---|---|---|
| Quran Reading | "All basic rules off Quran Reading with 100% Tajweed" | 30 minutes | 6 months |
| Quran Memorization | "Easy way to memorize part of The Quran or whole Quran" | 1 hour | 3 years |
| Quran Recitation | "Helps students to Recite The Holy Quran with Amazing Voices" | 30 minutes | 6 months |
| Quran Translation | "Complete The Holy Quran Translation and Tafseer" | 1 hour | 2 years |
| Islamic Education | "Aqeeda, Kalima, Salah, Dua's, Basic Ahadees etc." | 30 minutes | 6 months |

> Note: the homepage shows 3 courses; the Courses page shows 5. The replica shows all 5 on `/courses` and features the first 3 on the homepage, matching source behaviour.
>
> Copy note: "off" in the Reading description is a typo in the source. Corrected to "of" in the build — flagged here so the change is visible and reversible.

### 2.6 Fees Structure

**USD**

| Plan | Price | Class length | Per week | Admission | Sibling |
|---|---|---|---|---|---|
| Free Trial | $0 | 30 min | One Week (3 Days) | Free | 10% Off |
| 3 Days/Week | $40 | 30 min | 3 Per Week | Free | 10% Off |
| 5 Days/Week | $50 | 30 min | 5 Per Week | Free | 10% Off |

**GBP (United Kingdom)**

| Plan | Price | Class length | Per week | Admission | Sibling |
|---|---|---|---|---|---|
| Free Trial | £0 | 30 min | One Week (3 Days) | Free | 10% Off |
| 3 Days/Week | £30 | 30 min | 3 Per Week | Free | 10% Off |
| 5 Days/Week | £40 | 30 min | 5 Per Week | Free | 10% Off |

Currency switcher (USD/GBP) is a new addition replacing the source's two stacked tables.

### 2.7 CTA & Footer
- CTA: **"Give your Family the Beautiful Gift of Quran Recitation"** — "expert tutors can teach the Holy Quran with Tajweed and translation."
- **"Register For Online Classes"**
- Footer: contact details, quick links, courses, social, copyright.
- The source's "Developed by Innotech Cloud" credit is **not** carried over.

---

## 3. Design System Applied

All tokens extracted verbatim from `summercamp.amaujunior.com/assets/styles-HPM77IzR.css`.

### 3.1 Colour

```css
--cream:      #fef8ea;   /* page ground */
--cream-deep: #f5ecd3;   /* alternating sections, muted surfaces */
--ink:        #2d1b4d;   /* text, ALL borders, ALL hard shadows */
--purple:     #6b46c1;   /* primary — step badges, headings accent */
--teal:       #14b8a6;   /* success, underline decoration, accent shadow */
--magenta:    #db2777;   /* primary CTA buttons, focus ring */
--amber:      #f59e0b;   /* highlight cards, badges */
```

**Contrast rules (non-negotiable):**
- `--amber` on white = 2.1:1 → **never text**. Use as a *fill* with `--ink` text on top (8.9:1 ✓).
- `--teal` on white = 2.4:1 → **never text**. Underlines, borders, fills only.
- `--magenta` on white = 4.6:1 ✓ normal text; white on magenta ✓ for buttons.
- `--ink` on `--cream` = 13.9:1 ✓✓.

### 3.2 Typography

| Role | Family | Weights |
|---|---|---|
| Display | Bricolage Grotesque | 700, 800 |
| Body/UI | Outfit | 400, 500, 600, 700 |
| Marker | Shadows Into Light | 400 — decorative annotations only |

Hero display scale: `text-5xl sm:text-6xl md:text-7xl xl:text-8xl`, `leading-[1.05]`.
Body 16px minimum, `leading-relaxed`, measure capped ~70ch.

### 3.3 The Hard-Shadow Signature

```css
.hard-shadow      { box-shadow: 4px 4px 0 0 var(--ink); }
.hard-shadow-lg   { box-shadow: 8px 8px 0 0 var(--ink); }
.hard-shadow-teal { box-shadow: 8px 8px 0 0 var(--teal); }
.hard-shadow-mag  { box-shadow: 4px 4px 0 0 var(--magenta); }
```

Paired with `border-2` (controls) / `border-4` (cards) in `--ink`, and radii `rounded-full` (buttons/pills), `rounded-[2rem]`–`rounded-[3rem]` (cards/media).

**Press interaction** — element depresses into its own shadow, net-zero layout shift:

```
hover:translate-x-[3px] hover:translate-y-[3px] hover:shadow-none transition-all
```

Secondary link accent: `underline underline-offset-8 decoration-2 decoration-teal`.

### 3.4 Motion
- Marquee: `@keyframes marquee { from { translateX(0) } to { translateX(-50%) } }`, 30s linear infinite (6.6s mobile).
- Decorative rotations: `rotate-[-1deg]`, `-rotate-2`, `rotate-6` on highlight cards only.
- Media hover: `transition-transform duration-500`, `origin-top`, scale 1.05.
- Scroll reveals: fade + 12px rise, 400ms, staggered 60ms.
- **All motion gated behind `@media (prefers-reduced-motion: reduce)`.**

---

## 4. Page Structure

### `/` Home
1. **Utility bar** — phone, email, socials (ink on cream-deep)
2. **Sticky header** — logo, nav, Sign In, magenta Register CTA
3. **Hero** — display headline with "QURAN" in magenta; cream-gradient scrim over imagery; primary CTA + teal-underlined secondary; amber `rotate-[-1deg]` trust card
4. **Marquee** — "Since 2011 · One-on-One Live · Certified Teachers · Free Trial · All Timezones · Male & Female Tutors"
5. **3 Easy Steps** — numbered purple badges on a connected timeline (mirrors the reference `#journey`)
6. **Welcome / About** — "Start with the Name of Allah", mission, founder, stats
7. **Courses We Offer** — 3 featured cards, `border-4`, `hard-shadow`, per-card accent rotation
8. **Why Choose Us** — 6 feature tiles
9. **Fees preview** — 3 plan cards, middle one highlighted
10. **Testimonials** — parent quotes with country
11. **CTA band** — "Give your Family the Beautiful Gift of Quran Recitation"
12. **Registration form** — "Sign Up for a Free Trial Today"
13. **Footer**

### Other routes
`/courses` (all 5) · `/courses/[slug]` · `/about-us` · `/fees` (USD/GBP switcher) · `/downloads` · `/blog` · `/contact-us` · `/register` · `/signin`

---

## 5. Component Inventory

`Button` (primary/secondary/ghost, all with press interaction) · `Card` · `CourseCard` · `PricingCard` · `StepBadge` · `SectionHeading` · `Marquee` · `Header` (sticky, mobile drawer) · `Footer` · `RegistrationForm` (validated, 200+ countries, E.164 phone) · `Accordion` (FAQ) · `TestimonialCard` · `StatTile` · `Input`/`Select`/`Label` · `Container`

---

## 6. Quality Gates

- [ ] Lucide SVG icons only — no emoji as UI icons
- [ ] `cursor-pointer` on every clickable surface
- [ ] Visible magenta focus ring, 2px offset, on all interactive elements
- [ ] Hover never causes layout shift (translate + shadow-none is net-zero)
- [ ] Every input has `<label for>`; icon-only buttons have `aria-label`
- [ ] Contrast ≥ 4.5:1 normal text, ≥ 3:1 large text and UI boundaries
- [ ] Responsive at 375 / 768 / 1024 / 1440 — zero horizontal scroll
- [ ] `prefers-reduced-motion` honoured throughout
- [ ] Semantic landmarks, logical heading order, skip-to-content link
- [ ] Images: `next/image`, explicit dimensions, descriptive alt, lazy below fold
- [ ] Metadata + OpenGraph per route; sitemap; JSON-LD `EducationalOrganization` + `Course`
- [ ] Targets: LCP < 2.0s · INP < 200ms · CLS < 0.1
