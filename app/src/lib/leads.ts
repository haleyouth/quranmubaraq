import {
  addDoc,
  collection,
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

export type LeadStatusValue = "new" | "contacted" | "trial" | "enrolled" | "lost";

export type LeadInput = {
  name: string;
  email: string;
  phone: string;
  country: string;
  course?: string;
  teacherPreference?: string;
};

export type StoredLead = LeadInput & {
  id: string;
  status: LeadStatusValue;
  source: string;
  createdAt: Date | null;
};

/**
 * Writes a trial registration into the `leads` collection.
 *
 * Firestore rules allow create-only from the public site (see
 * app/firestore.rules); reads and updates are restricted to authenticated
 * staff, so a lead cannot be enumerated or tampered with from the browser.
 */
export async function createLead(input: LeadInput) {
  return addDoc(collection(db, "leads"), {
    ...input,
    status: "new",
    source: "website",
    createdAt: serverTimestamp(),
  });
}

/**
 * Reads submissions for the admin portal, newest first.
 *
 * Requires an authenticated staff session under the deployed rules. Until
 * Firebase Auth is wired up this will be rejected, which the caller surfaces
 * as an explanatory message rather than an error.
 */
export async function listLeads(max = 100): Promise<StoredLead[]> {
  const snapshot = await getDocs(
    query(collection(db, "leads"), orderBy("createdAt", "desc"), limit(max)),
  );

  return snapshot.docs.map((d) => {
    const data = d.data() as Omit<StoredLead, "id" | "createdAt"> & {
      createdAt?: Timestamp;
    };
    return {
      ...data,
      id: d.id,
      createdAt: data.createdAt?.toDate() ?? null,
    };
  });
}

/** Moves a lead through the pipeline. Staff only. */
export async function updateLeadStatus(id: string, status: LeadStatusValue) {
  return updateDoc(doc(db, "leads", id), { status });
}
