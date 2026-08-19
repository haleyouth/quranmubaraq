/**
 * Realtime messaging over Firestore.
 *
 * localStorage cannot carry a message between two people: it is scoped to one
 * browser profile, so a teacher on their laptop and a student on their phone
 * never share it. Delivery needs a server, and onSnapshot gives genuine
 * push — the recipient's thread updates without polling or a reload.
 *
 * The local store remains as an offline fallback so the demo still functions
 * before Firebase Auth is connected; see `messages.ts`.
 */

import {
  addDoc,
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type Timestamp,
  type Unsubscribe,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Role } from "./demo-auth";

export type LiveMessage = {
  id: string;
  threadId: string;
  fromName: string;
  fromRole: Role;
  /** Both names, so a recipient can query threads they belong to. */
  participants: string[];
  body: string;
  sentAt: Date | null;
  readBy: string[];
};

const COLLECTION = "messages";

/**
 * Subscribes to every thread this person belongs to.
 *
 * Filtering by participant server-side means a client never receives another
 * person's conversation, which the security rules also enforce.
 */
export function subscribeToMessages(
  personName: string,
  onChange: (messages: LiveMessage[]) => void,
  onError?: (err: unknown) => void,
): Unsubscribe {
  const q = query(
    collection(db, COLLECTION),
    where("participants", "array-contains", personName),
    orderBy("sentAt", "asc"),
    limit(500),
  );

  return onSnapshot(
    q,
    (snap) => {
      onChange(
        snap.docs.map((d) => {
          const data = d.data() as Omit<LiveMessage, "id" | "sentAt"> & {
            sentAt?: Timestamp;
          };
          return {
            ...data,
            id: d.id,
            // Pending writes have no server timestamp yet; treat as "now" so
            // the sender sees their own message immediately.
            sentAt: data.sentAt?.toDate() ?? new Date(),
            readBy: data.readBy ?? [],
          };
        }),
      );
    },
    (err) => onError?.(err),
  );
}

export async function sendLiveMessage(input: {
  threadId: string;
  fromName: string;
  fromRole: Role;
  toName: string;
  body: string;
}) {
  return addDoc(collection(db, COLLECTION), {
    threadId: input.threadId,
    fromName: input.fromName,
    fromRole: input.fromRole,
    participants: [input.fromName, input.toName].sort(),
    body: input.body,
    sentAt: serverTimestamp(),
    // The sender has by definition read their own message
    readBy: [input.fromName],
  });
}

/** Marks messages in a thread as read by this person. */
export async function markLiveThreadRead(
  messages: LiveMessage[],
  threadId: string,
  readerName: string,
) {
  const unread = messages.filter(
    (m) =>
      m.threadId === threadId &&
      m.fromName !== readerName &&
      !m.readBy.includes(readerName),
  );

  await Promise.all(
    unread.map((m) =>
      updateDoc(doc(db, COLLECTION, m.id), {
        readBy: [...m.readBy, readerName],
      }).catch(() => {
        /* a failed read receipt must never break the thread */
      }),
    ),
  );
}
