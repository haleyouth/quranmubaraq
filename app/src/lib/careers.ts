import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";

/* -------------------------------------------------------------------------- */
/*                                  Vacancies                                 */
/* -------------------------------------------------------------------------- */

export type Vacancy = {
  slug: string;
  title: string;
  type: "Full-time" | "Part-time" | "Contract";
  location: string;
  summary: string;
  responsibilities: readonly string[];
  requirements: readonly string[];
  accent: "green" | "green-deep" | "teal" | "gold";
};

export const vacancies: readonly Vacancy[] = [
  {
    slug: "quran-teacher-female",
    title: "Female Quran Teacher",
    type: "Part-time",
    location: "Remote · Your own timezone",
    summary:
      "Teach Quran reading, Tajweed and Hifz one-to-one to female students and young children. Flexible hours arranged around your availability.",
    responsibilities: [
      "Teach scheduled one-to-one classes of 30 to 60 minutes",
      "Record attendance and a short progress comment after every class",
      "Prepare students for regular assessments",
      "Communicate with parents through the academy portal",
    ],
    requirements: [
      "Hafiza, or a formal qualification in Quranic studies",
      "Strong Tajweed and clear Arabic pronunciation",
      "Conversational English or Urdu",
      "Reliable internet, a quiet room, and a working camera and microphone",
      "Patience with young children",
    ],
    accent: "green",
  },
  {
    slug: "quran-teacher-male",
    title: "Male Quran Teacher",
    type: "Part-time",
    location: "Remote · Your own timezone",
    summary:
      "Teach Quran reading, recitation and memorization one-to-one. Suited to qualified Huffaz who can commit to a consistent weekly schedule.",
    responsibilities: [
      "Teach scheduled one-to-one classes of 30 to 60 minutes",
      "Follow the academy's sabaq, sabqi and manzil method for Hifz students",
      "Record attendance and progress after every class",
      "Attend a short monthly staff review",
    ],
    requirements: [
      "Hafiz, with an ijazah preferred",
      "Strong Tajweed and clear Arabic pronunciation",
      "Conversational English or Urdu",
      "Reliable internet and a quiet teaching space",
    ],
    accent: "green-deep",
  },
  {
    slug: "islamic-studies-teacher",
    title: "Islamic Studies Teacher",
    type: "Part-time",
    location: "Remote · Your own timezone",
    summary:
      "Teach Aqeeda, Salah, daily Duas and foundational Ahadees to children aged 5 to 14, in a way that emphasises practice over memorised theory.",
    responsibilities: [
      "Deliver the Islamic Education curriculum one-to-one",
      "Adapt explanations to the age and level of each child",
      "Report progress to parents through the portal",
    ],
    requirements: [
      "Formal training in Islamic studies or Shari'ah",
      "Experience teaching children",
      "Fluent English",
    ],
    accent: "teal",
  },
  {
    slug: "admissions-coordinator",
    title: "Admissions Coordinator",
    type: "Full-time",
    location: "Remote · UK or Pakistan hours",
    summary:
      "Be the first person a family speaks to. Handle trial registrations, match students to teachers, and shepherd families from enquiry to enrolment.",
    responsibilities: [
      "Respond to website registrations within one working day",
      "Arrange trial classes and match students to suitable teachers",
      "Follow up after trials and record outcomes in the CRM",
      "Support families with scheduling and billing questions",
    ],
    requirements: [
      "Excellent written and spoken English",
      "Comfortable with CRM software and spreadsheets",
      "Warm, organised and reliable with follow-up",
      "Urdu or Arabic an advantage",
    ],
    accent: "gold",
  },
] as const;

export function getVacancy(slug: string) {
  return vacancies.find((v) => v.slug === slug);
}

/* -------------------------------------------------------------------------- */
/*                                Applications                                */
/* -------------------------------------------------------------------------- */

export type ApplicationStatus =
  | "new"
  | "reviewing"
  | "interview"
  | "hired"
  | "rejected";

export type ApplicationInput = {
  name: string;
  email: string;
  phone: string;
  country: string;
  role: string;
  gender: string;
  /** ISO yyyy-mm-dd. */
  dateOfBirth: string;
  age?: number;
  qualifications: string;
  experienceYears: string;
  availability: string;
  message: string;
};

export type StoredApplication = ApplicationInput & {
  id: string;
  status: ApplicationStatus;
  source: string;
  createdAt: Date | null;
  note?: string;
};

export type ApplicationEdit = Partial<
  Pick<
    StoredApplication,
    | "name" | "email" | "phone" | "country" | "role" | "gender"
    | "dateOfBirth" | "age" | "qualifications" | "experienceYears"
    | "availability" | "message" | "status" | "note"
  >
>;

/**
 * Submits a job application.
 *
 * Mirrors the leads collection: create-only from the public site, with reads
 * and edits restricted to staff by the security rules.
 */
export async function createApplication(input: ApplicationInput) {
  return addDoc(collection(db, "applications"), {
    ...input,
    status: "new",
    source: "careers",
    createdAt: serverTimestamp(),
  });
}

export async function listApplications(max = 100): Promise<StoredApplication[]> {
  const snapshot = await getDocs(
    query(collection(db, "applications"), orderBy("createdAt", "desc"), limit(max)),
  );

  return snapshot.docs.map((d) => {
    const data = d.data() as Omit<StoredApplication, "id" | "createdAt"> & {
      createdAt?: Timestamp;
    };
    return { ...data, id: d.id, createdAt: data.createdAt?.toDate() ?? null };
  });
}

export async function updateApplication(id: string, changes: ApplicationEdit) {
  return updateDoc(doc(db, "applications", id), changes);
}

export async function deleteApplication(id: string) {
  return deleteDoc(doc(db, "applications", id));
}
