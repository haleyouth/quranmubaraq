/**
 * Site content — transcribed from quranmubarak.com.
 * Single source of truth so copy changes never require touching components.
 */

export const site = {
  name: "Quran Mubarak",
  tagline: "The Islamic Center",
  description:
    "One of the top listed Online Islamic education Academy in the World with great customer satisfaction. Learn Quran online with certified tutors.",
  founded: 2011,
  founder: "Qasim Shafiq Mir",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://quranmubarak.com",
  /** Legacy LMS being replaced by /admin. Retained for reference and migration. */
  legacyPortalUrl: "https://qmlearning.com/app/dashboard",
  phone: "0345-5997954",
  phoneHref: "tel:+923455997954",
  email: "info@quranmubarak.com",
  whatsapp: "https://wa.me/923455997954",
} as const;

export const nav = [
  { label: "Home", href: "/" },
  { label: "Courses", href: "/courses" },
  { label: "About us", href: "/about-us" },
  { label: "Fees Structure", href: "/fees" },
  { label: "Downloads", href: "/downloads" },
  { label: "Blog", href: "/blog" },
  { label: "Contact Us", href: "/contact-us" },
] as const;

/**
 * Verified against the live quranmubarak.com markup.
 * Note: the source site's Skype href is malformed (`skype:https://join.skype…`),
 * which browsers cannot resolve. The correct join URL is used here.
 */
export const socials = [
  {
    label: "Facebook",
    href: "https://www.facebook.com/quranmubarak1/",
    icon: "facebook",
  },
  {
    label: "Twitter",
    href: "https://twitter.com/Quran_Academy11",
    icon: "twitter",
  },
  {
    label: "YouTube",
    href: "https://www.youtube.com/channel/UCP9o1zZ736TKmz4q3OiA9wA",
    icon: "youtube",
  },
  {
    label: "Skype",
    href: "https://join.skype.com/invite/JTuXyugdOhww",
    icon: "skype",
  },
] as const;

/** Free resources mirrored from the academy's existing downloads page. */
export const downloads = [
  {
    title: "Basic Qaida (English)",
    description:
      "The complete Noorani Qaida with English instruction — the foundational primer for learning to read Arabic letters and words.",
    file: "/downloads/Basic-Qaida-English.pdf",
    size: "9.4 MB",
    accent: "bg-green",
  },
  {
    title: "Basic Qaida (Urdu)",
    description:
      "The same foundational Qaida with Urdu instruction, for families who prefer to study in Urdu at home.",
    file: "/downloads/Basic-Qaida-Urdu.pdf",
    size: "10.8 MB",
    accent: "bg-green-deep",
  },
  {
    title: "Essential Duas",
    description:
      "Everyday supplications every Muslim should know, with Arabic text, transliteration and translation.",
    file: "/downloads/Essential-Duas.pdf",
    size: "10.0 MB",
    accent: "bg-teal",
  },
  {
    title: "Tajweedi Colour Quran",
    description:
      "The complete Holy Quran with colour-coded Tajweed rules. Hosted externally due to its size (150 MB).",
    file: "https://quranmubarak.com/wp-content/uploads/2021/07/Tajweedi-colour-Quran.pdf",
    size: "150 MB",
    accent: "bg-gold",
    external: true,
  },
] as const;

/* -------------------------------------------------------------------------- */
/*                                    Hero                                    */
/* -------------------------------------------------------------------------- */

export const hero = {
  eyebrow: "Since 2011 · The Original Online Quran Tutoring Service",
  headline: { before: "Start Learning", highlight: "QURAN", after: "In 3 Easy Steps" },
  subtext:
    "One-on-one live tutoring with certified male and female teachers. Learn to read, memorize and recite the Holy Quran with 100% Tajweed — from anywhere in the world, at a time that suits your family.",
  primaryCta: { label: "Start free trial", href: "/register" },
  secondaryCta: { label: "View courses", href: "/courses" },
  trustCard: {
    title: "Your first week is free.",
    body: "Three trial classes, no card required, no obligation to continue.",
  },
} as const;

export const marqueeItems = [
  "Since 2011",
  "One-on-One Live Classes",
  "Certified Teachers",
  "Free Trial Week",
  "All Timezones",
  "Male & Female Tutors",
  "100% Tajweed",
  "10% Sibling Discount",
] as const;

/* -------------------------------------------------------------------------- */
/*                                 Three steps                                */
/* -------------------------------------------------------------------------- */

export const steps = [
  {
    number: "1",
    title: "Free Register",
    subtitle: "Fill the form",
    body: "Tell us your name, email, phone and country. It takes under a minute and costs nothing.",
    accent: "purple",
  },
  {
    number: "2",
    title: "Trial Classes",
    subtitle: "Start free class",
    body: "We match you with a suitable teacher and schedule three free 30-minute classes in your timezone.",
    accent: "magenta",
  },
  {
    number: "3",
    title: "Enroll Today",
    subtitle: "Take full course",
    body: "Happy with your teacher? Choose a plan and continue. Admission is always free.",
    accent: "teal",
  },
] as const;

/* -------------------------------------------------------------------------- */
/*                                    About                                   */
/* -------------------------------------------------------------------------- */

export const about = {
  bismillah: "Start with the Name of Allah",
  heading: "Welcome to Quran Mubarak",
  subheading: "Islamic Center for Muslims to Achieve Spiritual Goals",
  body: [
    "Quran Mubarak is one of the top listed Online Islamic education Academy in the World with great customer satisfaction.",
    "Our mission is to teach Quran and other Islamic education in easy and simple ways — so that every Muslim, whatever their age or wherever they live, can build a lasting relationship with the Book of Allah.",
    `Founded by ${site.founder} in ${site.founded}, we have spent over a decade refining one-on-one live tutoring between teacher and student, allowing every learner to progress at their own pace.`,
  ],
  stats: [
    { value: "2011", label: "Teaching since" },
    { value: "5", label: "Courses offered" },
    { value: "1-on-1", label: "Live tutoring" },
    { value: "Free", label: "Trial week" },
  ],
} as const;

/* -------------------------------------------------------------------------- */
/*                                   Courses                                  */
/* -------------------------------------------------------------------------- */

export type Course = {
  slug: string;
  title: string;
  short: string;
  description: string;
  /** Search-result description, kept to 120-160 characters. */
  metaDescription: string;
  daily: string;
  duration: string;
  level: string;
  accent: "purple" | "magenta" | "teal" | "amber";
  featured: boolean;
  outcomes: readonly string[];
};

export const courses: readonly Course[] = [
  {
    slug: "quran-reading",
    metaDescription: "Learn to read the Holy Quran fluently with 100% Tajweed. One-to-one live classes, 30 minutes daily over 6 months, for complete beginners.",
    title: "Quran Reading Course",
    short: "All basic rules of Quran Reading with 100% Tajweed",
    description:
      "Begin at the very beginning. This course takes a complete beginner from recognising Arabic letters through to reading the Holy Quran fluently, applying all the basic rules of Tajweed correctly and confidently.",
    daily: "30 minutes",
    duration: "6 months",
    level: "Beginner",
    accent: "purple",
    featured: true,
    outcomes: [
      "Recognise and pronounce every Arabic letter correctly",
      "Master Noorani Qaida from start to finish",
      "Apply all basic rules of Tajweed",
      "Read the Holy Quran fluently and independently",
    ],
  },
  {
    slug: "quran-memorization",
    metaDescription: "Structured online Hifz programme using daily sabaq, sabqi and manzil. One hour daily with a qualified hafiz, at a pace your child can sustain.",
    title: "Quran Memorization Course",
    short: "Easy way to memorize part of The Quran or whole Quran",
    description:
      "A structured Hifz programme built around daily sabaq, sabqi and manzil. Whether your goal is the last juz or the entire Quran, your teacher sets a pace your child can genuinely sustain — and revises relentlessly so what is memorised stays memorised.",
    daily: "1 hour",
    duration: "3 years",
    level: "Intermediate",
    accent: "magenta",
    featured: true,
    outcomes: [
      "Proven daily sabaq, sabqi and manzil method",
      "Memorize selected surahs, a juz, or the complete Quran",
      "Structured revision so memorisation is retained",
      "Regular assessment and progress reporting to parents",
    ],
  },
  {
    slug: "quran-recitation",
    metaDescription: "Learn beautiful Quran recitation with the maqamat and the styles of renowned Qurra. Live one-to-one classes, 30 minutes daily over 6 months.",
    title: "Quran Recitation Course",
    short: "Helps students to Recite The Holy Quran with Amazing Voices",
    description:
      "Move beyond correct reading to beautiful recitation. Students learn the maqamat and the recitation styles of the renowned Qurra, developing the melody, breath control and confidence to lead and to recite beautifully.",
    daily: "30 minutes",
    duration: "6 months",
    level: "Intermediate",
    accent: "teal",
    featured: true,
    outcomes: [
      "Advanced Tajweed refinement",
      "Learn the maqamat and recitation styles",
      "Develop breath control and melody",
      "Recite with confidence before others",
    ],
  },
  {
    slug: "quran-translation",
    metaDescription: "Understand what you recite. Word-by-word Quran translation with Tafseer and context, taught live one-to-one over two years.",
    title: "Quran Translation Course",
    short: "Complete The Holy Quran Translation and Tafseer",
    description:
      "Understand what you recite. This course works word by word through the Holy Quran with translation and Tafseer, drawing out the context, meaning and lessons of each passage.",
    daily: "1 hour",
    duration: "2 years",
    level: "Advanced",
    accent: "amber",
    featured: false,
    outcomes: [
      "Word-by-word translation of the Holy Quran",
      "Tafseer and the context of revelation",
      "Core Quranic Arabic vocabulary and grammar",
      "Practical lessons drawn from each surah",
    ],
  },
  {
    slug: "islamic-education",
    metaDescription: "Learn Aqeeda, the six Kalimas, Salah, daily Duas and authentic Ahadees. Live one-to-one Islamic studies, 30 minutes daily over 6 months.",
    title: "Islamic Education Course",
    short: "Aqeeda, Kalima, Salah, Dua's, Basic Ahadees etc.",
    description:
      "The essentials every Muslim should know. Covering Aqeeda, the six Kalimas, the pillars of Salah, daily Duas, and a foundation of authentic Ahadees — taught simply, with the emphasis on daily practice rather than memorised theory.",
    daily: "30 minutes",
    duration: "6 months",
    level: "All levels",
    accent: "purple",
    featured: false,
    outcomes: [
      "Correct Aqeeda and the six Kalimas",
      "Perform Salah correctly with confidence",
      "Daily Duas and adhkar for every occasion",
      "A foundation of authentic Ahadees and Seerah",
    ],
  },
] as const;

export const featuredCourses = courses.filter((c) => c.featured);

/* -------------------------------------------------------------------------- */
/*                                Why choose us                               */
/* -------------------------------------------------------------------------- */

export const features = [
  {
    icon: "user-round",
    title: "One-on-One Live Classes",
    body: "Never a crowded group call. Every class is your child alone with their teacher, progressing at their own pace.",
  },
  {
    icon: "graduation-cap",
    title: "Certified Qualified Teachers",
    body: "Qualified Huffaz and Islamic scholars, selected for their teaching ability with children as much as their credentials.",
  },
  {
    icon: "users-round",
    title: "Male & Female Tutors",
    body: "Choose the teacher your family is comfortable with. Female students may always request a female teacher.",
  },
  {
    icon: "clock",
    title: "Flexible Timings",
    body: "Classes scheduled in your local timezone, around school and work. Reschedule when life gets in the way.",
  },
  {
    icon: "gift",
    title: "Free Trial Week",
    body: "Three free classes before you pay anything. No card required, and no obligation to continue.",
  },
  {
    icon: "chart-line",
    title: "Progress Reports",
    body: "See exactly what your child covered in every class, with regular assessments shared with parents.",
  },
] as const;

/* -------------------------------------------------------------------------- */
/*                                    Fees                                    */
/* -------------------------------------------------------------------------- */

export type Plan = {
  name: string;
  usd: string;
  gbp: string;
  classLength: string;
  frequency: string;
  admission: string;
  sibling: string;
  highlighted: boolean;
  cta: string;
};

export const plans: readonly Plan[] = [
  {
    name: "Free Trial",
    usd: "0",
    gbp: "0",
    classLength: "30 minutes",
    frequency: "One Week (3 Days)",
    admission: "Free",
    sibling: "10% Off",
    highlighted: false,
    cta: "Start free trial",
  },
  {
    name: "3 Days / Week",
    usd: "40",
    gbp: "30",
    classLength: "30 minutes",
    frequency: "3 Per Week",
    admission: "Free",
    sibling: "10% Off",
    highlighted: true,
    cta: "Choose 3 days",
  },
  {
    name: "5 Days / Week",
    usd: "50",
    gbp: "40",
    classLength: "30 minutes",
    frequency: "5 Per Week",
    admission: "Free",
    sibling: "10% Off",
    highlighted: false,
    cta: "Choose 5 days",
  },
] as const;

/* -------------------------------------------------------------------------- */
/*                                Testimonials                                */
/* -------------------------------------------------------------------------- */

export const testimonials = [
  {
    quote:
      "My son had struggled with Arabic letters for two years. Six months with his teacher at Quran Mubarak and he is reading fluently, masha'Allah. The one-on-one attention made all the difference.",
    name: "Umm Yusuf",
    location: "London, United Kingdom",
  },
  {
    quote:
      "As a working parent I needed flexibility, and I got it. Classes fit around school, the teacher is patient and consistent, and I get a report after every single class.",
    name: "Abdul Rahman",
    location: "Toronto, Canada",
  },
  {
    quote:
      "We tried three academies before this one. The difference is that the teachers actually care whether my daughter is progressing — and they tell me honestly when she needs to revise.",
    name: "Fatima S.",
    location: "Sydney, Australia",
  },
] as const;

/* -------------------------------------------------------------------------- */
/*                                     FAQ                                    */
/* -------------------------------------------------------------------------- */

export const faqs = [
  {
    q: "How does the free trial work?",
    a: "Register with the form and we will contact you to arrange three free 30-minute classes over one week. No card is required, and there is no obligation to continue afterwards.",
  },
  {
    q: "What age can my child start?",
    a: "We teach students from around five years old through to adults. Classes are always one-on-one, so the teacher adapts entirely to the age and level of the individual student.",
  },
  {
    q: "Can we request a female teacher?",
    a: "Yes. We have both male and female qualified teachers, and you may request the teacher your family is comfortable with at registration or at any point afterwards.",
  },
  {
    q: "What do we need to join a class?",
    a: "A device with a camera and microphone — laptop, tablet or phone — and a stable internet connection. Classes are held over Zoom and we send the joining link in advance.",
  },
  {
    q: "What if we need to miss a class?",
    a: "Let your teacher or our administration know in advance and we will reschedule it. We would rather move a class than have you miss the material.",
  },
  {
    q: "Do you offer a discount for more than one child?",
    a: "Yes — every additional sibling receives 10% off their plan. Admission is free for every student regardless of how many children you enrol.",
  },
  {
    q: "Which countries do you teach in?",
    a: "All of them. Our students are worldwide and classes are scheduled in your local timezone, so families in the UK, US, Canada, Australia and the Gulf are all accommodated.",
  },
  {
    q: "How do we pay?",
    a: "Fees are billed monthly and there is no long-term contract. You may cancel or pause at any time by letting our administration know.",
  },
] as const;

/* -------------------------------------------------------------------------- */
/*                                     CTA                                    */
/* -------------------------------------------------------------------------- */

export const cta = {
  heading: "Give your Family the Beautiful Gift of Quran Recitation",
  body: "Our expert tutors can teach the Holy Quran with Tajweed and translation — one-on-one, live, in your timezone.",
  primary: { label: "Register For Online Classes", href: "/register" },
  secondary: { label: "Chat on WhatsApp", href: site.whatsapp },
} as const;

export const registrationForm = {
  heading: "Sign Up for a Free Trial Today",
  body: "Fill in the form and our team will contact you within one working day to arrange your free trial classes.",
} as const;
