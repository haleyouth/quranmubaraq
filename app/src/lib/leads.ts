import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";

export type LeadInput = {
  name: string;
  email: string;
  phone: string;
  country: string;
  course?: string;
  teacherPreference?: string;
};

/**
 * Writes a trial registration into the `leads` collection.
 *
 * Firestore rules allow create-only from the public site (see firestore.rules);
 * reads and updates are restricted to authenticated staff, so a lead cannot be
 * enumerated or tampered with from the browser.
 */
export async function createLead(input: LeadInput) {
  return addDoc(collection(db, "leads"), {
    ...input,
    status: "new",
    source: "website",
    createdAt: serverTimestamp(),
  });
}
