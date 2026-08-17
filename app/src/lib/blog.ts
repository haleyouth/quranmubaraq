/**
 * Blog articles.
 *
 * Written for Quran Mubarak's audience of Muslim parents. Content is held
 * here as structured data; when a CMS is introduced these records become the
 * migration source.
 */

export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readingMinutes: number;
  published: string;
  author: string;
  accent: "green" | "green-deep" | "teal" | "gold";
  body: readonly { heading?: string; paragraphs: readonly string[] }[];
};

export const posts: readonly Post[] = [
  {
    slug: "helping-your-child-love-the-quran",
    title: "Helping your child love the Quran, not just read it",
    excerpt:
      "Fluency without affection rarely lasts. Practical ways to build a relationship between your child and the Book of Allah that outlives their lessons.",
    category: "Parenting",
    readingMinutes: 6,
    published: "2026-08-10",
    author: "Quran Mubarak",
    accent: "green",
    body: [
      {
        paragraphs: [
          "Most parents come to us with the same goal stated the same way: they want their child to be able to read the Quran. It is a good goal. But after fifteen years of teaching, we have learned that it is an incomplete one.",
          "A child who can decode Arabic letters but feels nothing when they open the mushaf will stop opening it the moment nobody is checking. A child who loves the Quran will return to it for the rest of their life, and their fluency will keep improving long after their last paid lesson.",
        ],
      },
      {
        heading: "Separate the lesson from the relationship",
        paragraphs: [
          "Classes are where correction happens. Correction is necessary, but it is not affection. If every single encounter your child has with the Quran involves being told what they got wrong, they will quietly begin to associate the Book with failure.",
          "Balance this deliberately. Set aside time where the Quran is simply listened to, not performed. Play a recitation your family loves during breakfast. Read a short surah together with no assessment attached. The goal is for your child to have memories of the Quran where nobody was marking them.",
        ],
      },
      {
        heading: "Tell them what it means",
        paragraphs: [
          "Children are not motivated by abstractions. \"This is the word of Allah\" is true, but to a seven-year-old it is not yet meaningful. What reaches them is story and consequence.",
          "When your child learns Surah Al-Fil, tell them about the elephants. When they read Surah Yusuf, tell them it is a story about a brother who was wronged and forgave. Meaning is what converts recitation from a chore into something a child actually wants to continue.",
        ],
      },
      {
        heading: "Protect consistency over intensity",
        paragraphs: [
          "Parents often ask whether an hour a day is better than thirty minutes. In almost every case, thirty minutes a day, five days a week, beats a long weekend session — because the long session is the one that gets cancelled when life gets busy.",
          "This is why our classes are short and frequent. Consistency compounds. Intensity burns out, and a burnt-out child is much harder to bring back than a slow one.",
        ],
      },
      {
        heading: "Let them hear you struggle",
        paragraphs: [
          "If your child only ever sees adults who recite perfectly, they will conclude that difficulty means they are not suited to it. Recite in front of them. Make a mistake. Correct yourself and carry on without drama.",
          "What you are teaching in that moment is more valuable than any Tajweed rule: that the Quran is for people who are still learning, which is all of us.",
        ],
      },
    ],
  },
  {
    slug: "what-tajweed-actually-is",
    title: "What Tajweed actually is — and why it matters",
    excerpt:
      "Tajweed is often taught as a list of rules to memorise. It is better understood as the preservation of how the Quran was actually revealed.",
    category: "Learning",
    readingMinutes: 5,
    published: "2026-07-28",
    author: "Quran Mubarak",
    accent: "green-deep",
    body: [
      {
        paragraphs: [
          "Ask most students what Tajweed is and they will recite a list: idgham, ikhfa, qalqalah, madd. They are not wrong. But a list of rules explains what Tajweed requires without explaining what it is for.",
          "Tajweed is the science of preserving the pronunciation of the Quran exactly as the Prophet ﷺ received it and taught it. Every rule exists because a specific sound had to be protected from drifting over fourteen centuries of transmission.",
        ],
      },
      {
        heading: "Why the rules feel arbitrary at first",
        paragraphs: [
          "The rules feel arbitrary because they are usually taught before the reason. A student is told that a noon sakinah followed by a ba becomes an m sound, and dutifully memorises it. Nobody explains that this is simply what the Arabic mouth does naturally at speed, and the rule exists to record that fact rather than invent it.",
          "Once a student understands that Tajweed is describing something rather than imposing something, the rules stop feeling like a test and start feeling like a map.",
        ],
      },
      {
        heading: "The part that cannot be learned from a book",
        paragraphs: [
          "Tajweed is transmitted orally. This is not tradition for its own sake — it is a practical necessity. You cannot learn the precise articulation point of the letter ض from a written description, no matter how detailed. You need someone to say it, listen to you say it back, and correct the difference.",
          "This is the single strongest argument for one-to-one teaching, and it is why we do not run large group classes. In a class of thirty, most students are never actually heard.",
        ],
      },
      {
        heading: "How long it takes",
        paragraphs: [
          "For a beginner working thirty minutes a day, the basic rules of Tajweed take roughly six months to cover and considerably longer to internalise. That is normal, and a teacher who promises much faster is usually skipping the listening.",
          "Perfection is not the standard, and it never was. The standard is sincere effort — the Prophet ﷺ taught that one who struggles with the Quran receives a double reward.",
        ],
      },
    ],
  },
  {
    slug: "choosing-an-online-quran-academy",
    title: "Seven questions to ask before choosing an online Quran academy",
    excerpt:
      "Online Quran teaching has grown quickly, and quality varies enormously. These are the questions that reveal the difference.",
    category: "Guidance",
    readingMinutes: 7,
    published: "2026-07-12",
    author: "Quran Mubarak",
    accent: "teal",
    body: [
      {
        paragraphs: [
          "We are an online Quran academy, so treat this article with appropriate scepticism. We have nonetheless written it honestly, including the questions whose answers do not always flatter us.",
        ],
      },
      {
        heading: "1. Will my child be taught alone or in a group?",
        paragraphs: [
          "This is the most important question, and the one most often answered vaguely. In a group class the teacher cannot hear each student's pronunciation individually, which is precisely what Tajweed requires. Ask for a direct answer.",
        ],
      },
      {
        heading: "2. What are the teacher's actual qualifications?",
        paragraphs: [
          "\"Qualified\" and \"certified\" are unregulated words. Ask specifically: is the teacher a hafiz? Where did they study? Do they hold an ijazah? A serious academy will answer without hesitation.",
        ],
      },
      {
        heading: "3. Can we request a female teacher?",
        paragraphs: [
          "Many families need this, and some academies simply do not have female staff while implying otherwise. Ask directly, and ask how many.",
        ],
      },
      {
        heading: "4. What happens when we miss a class?",
        paragraphs: [
          "Life interferes. An academy that charges for missed classes with no rescheduling is optimising for its own convenience. Ask what the actual policy is, in writing.",
        ],
      },
      {
        heading: "5. How will I know if my child is progressing?",
        paragraphs: [
          "Without reporting, you are relying entirely on your child's own account. Ask what you will receive, how often, and whether it is written or verbal.",
        ],
      },
      {
        heading: "6. Is there a contract?",
        paragraphs: [
          "There should not be. Monthly billing with the freedom to stop is the fair arrangement. Long lock-ins usually indicate an academy that expects students to want to leave.",
        ],
      },
      {
        heading: "7. Can we try before we pay?",
        paragraphs: [
          "A trial is the only way to judge whether a specific teacher suits your specific child — and that pairing matters more than any institutional reputation. Any academy confident in its teachers will offer one free.",
        ],
      },
    ],
  },
  {
    slug: "starting-hifz-what-to-expect",
    title: "Starting Hifz: what parents should realistically expect",
    excerpt:
      "Memorising the Quran is a years-long commitment. An honest account of the timeline, the plateaus, and what actually determines success.",
    category: "Memorization",
    readingMinutes: 8,
    published: "2026-06-20",
    author: "Quran Mubarak",
    accent: "gold",
    body: [
      {
        paragraphs: [
          "Hifz is the most demanding thing we teach, and the area where expectations most often diverge from reality. This article is deliberately unromantic.",
        ],
      },
      {
        heading: "The timeline",
        paragraphs: [
          "A child memorising one hour a day, five days a week, typically completes the Quran in three to four years. Some do it faster. Many take longer, and taking longer is not failure.",
          "Be sceptical of anyone promising a complete Hifz in a year for a child studying an hour a day. It is arithmetically possible only by sacrificing revision — which means the memorisation will not survive.",
        ],
      },
      {
        heading: "Sabaq, sabqi, manzil",
        paragraphs: [
          "Hifz has three daily components: the new portion (sabaq), recent revision (sabqi), and older revision (manzil). Parents often focus entirely on the first and wonder why earlier surahs are slipping away.",
          "As the memorised portion grows, revision consumes more of the hour than new memorisation. By the third year, most of the session is revision. This is correct, not a sign of slow progress.",
        ],
      },
      {
        heading: "The plateau at juz 10",
        paragraphs: [
          "Almost every student hits a wall somewhere between juz 8 and 12. The revision load becomes heavy, the novelty has worn off, and progress feels invisible.",
          "This is the point at which most children who abandon Hifz do so. It is also entirely predictable, which means you can prepare for it. Reduce the new material temporarily, protect the revision, and let them move through it slowly rather than stopping.",
        ],
      },
      {
        heading: "What actually determines success",
        paragraphs: [
          "In our experience it is not intelligence, and it is not memory. The children who complete Hifz are overwhelmingly the ones whose families kept the schedule stable through difficult periods.",
          "The single strongest predictor is whether the family treats the daily session as non-negotiable in the way that school is non-negotiable. Talent varies. Consistency is decisive.",
        ],
      },
      {
        heading: "A word on pressure",
        paragraphs: [
          "Hifz undertaken under sustained pressure produces children who complete it and then never open the Quran again. We have met them. It is a heartbreaking outcome, and it is avoidable.",
          "If your child needs to slow down, let them slow down. The goal is a lifelong relationship with the Book of Allah, not a certificate by a certain birthday.",
        ],
      },
    ],
  },
] as const;

export function getPost(slug: string) {
  return posts.find((p) => p.slug === slug);
}
