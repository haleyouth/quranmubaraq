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

export type LeadStatusValue = "new" | "contacted" | "trial" | "enrolled" | "lost";

export type LeadInput = {
  name: string;
  email: string;
  phone: string;
  country: string;
  course?: string;
  teacherPreference?: string;
  /** ISO yyyy-mm-dd. Drives cohort placement and teacher matching. */
  dateOfBirth?: string;
  /** Age in whole years at submission, stored so staff need not recompute. */
  age?: number;
};

export type StoredLead = LeadInput & {
  id: string;
  status: LeadStatusValue;
  source: string;
  createdAt: Date | null;
  /** Free-text note added by staff while following the lead up. */
  note?: string;
  /** Staff member handling this lead. */
  owner?: string;
};

/** Fields staff may change. Email and phone are editable because parents
 *  routinely mistype them on the public form. */
export type LeadEdit = Partial<
  Pick<
    StoredLead,
    | "name" | "email" | "phone" | "country" | "course" | "teacherPreference"
    | "dateOfBirth" | "age" | "note" | "owner" | "status"
  >
>;

/**
 * Trial-class requests submitted from the public registration form.
 *
 * The Firestore collection is still named `leads` because renaming it would
 * orphan existing documents; staff manage these under Submissions.
 */

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

/** Applies staff edits to a lead. Staff only, enforced by security rules. */
export async function updateLead(id: string, changes: LeadEdit) {
  return updateDoc(doc(db, "leads", id), changes);
}

/**
 * Permanently removes a lead.
 *
 * Deletion is genuine rather than a soft flag, because a lead is a contact
 * enquiry containing personal data: a parent asking to be removed should be
 * removed. Enrolled students are never deleted this way — they become
 * student records with their own retention rules.
 */
export async function deleteLead(id: string) {
  return deleteDoc(doc(db, "leads", id));
}
