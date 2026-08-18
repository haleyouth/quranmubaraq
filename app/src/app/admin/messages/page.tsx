"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Info, MessageSquarePlus, Search, Send, ShieldCheck } from "lucide-react";
import { getSession, type Role, type Session } from "@/lib/admin/demo-auth";
import {
  canMessage, contactsFor, loadMessages, markThreadRead, persistMessage,
  resetMessages, subscribeMessages, threadId, timeAgo,
  type Message, type Party,
} from "@/lib/admin/messages";
import {
  AdminButton, AdminPage, Badge, DemoNotice, Panel, inputClass,
} from "@/components/admin/ui";
import { Modal } from "@/components/admin/Modal";
import { cn } from "@/lib/utils";

const ROLE_TONE = {
  admin: "gold",
  principal: "greenDeep",
  teacher: "green",
  student: "sage",
} as const;

export default function MessagesPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [query, setQuery] = useState("");
  const [composing, setComposing] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // Messages live in a shared store, so a message sent by one account is
  // visible when you sign in as the other — and updates live across tabs.
  useEffect(() => {
    setSession(getSession());
    const refresh = () => setMessages(loadMessages());
    refresh();
    const unsubscribe = subscribeMessages(refresh);
    // Keeps the relative timestamps ("34m ago") honest
    const tick = window.setInterval(refresh, 30_000);
    return () => {
      unsubscribe();
      window.clearInterval(tick);
    };
  }, []);

  const contacts = useMemo(
    () => (session ? contactsFor(session.role, session.name) : []),
    [session],
  );

  /** Conversations this person is party to, newest first. */
  const conversations = useMemo(() => {
    if (!session) return [];
    return contacts
      .map((c) => {
        const id = threadId(session.name, c.name);
        // minutesAgo counts backwards, so descending == oldest first
        const msgs = messages
          .filter((m) => m.threadId === id)
          .sort((a, b) => b.minutesAgo - a.minutesAgo);
        const last = msgs[msgs.length - 1]; // most recent
        const unread = msgs.filter((m) => !m.read && m.fromName !== session.name).length;
        return { contact: c, id, msgs, last, unread };
      })
      .filter((c) => c.msgs.length > 0 || c.id === active)
      .sort((a, b) => (a.last?.minutesAgo ?? 1e9) - (b.last?.minutesAgo ?? 1e9));
  }, [contacts, messages, session, active]);

  const filtered = conversations.filter((c) =>
    c.contact.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const current = conversations.find((c) => c.id === active) ?? null;

  // Keep the newest message in view as the thread grows
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [active, messages]);

  // Mark the open thread as read for this reader only
  useEffect(() => {
    if (!active || !session) return;
    markThreadRead(active, session.name);
  }, [active, session, messages.length]);

  if (!session) return null;

  function send() {
    if (!session || !current || !draft.trim()) return;
    if (!canMessage(session.role, session.name, current.contact.name)) return;

    persistMessage({
      id: `M-${Date.now()}-${Math.round(Math.random() * 1e6)}`,
      threadId: current.id,
      fromName: session.name,
      fromRole: session.role,
      body: draft.trim(),
      read: false, // unread for the recipient until they open the thread
    });
    setMessages(loadMessages());
    setDraft("");
  }

  function startThread(c: Party) {
    if (!session) return;
    setActive(threadId(session.name, c.name));
    setComposing(false);
  }

  const totalUnread = conversations.reduce((a, c) => a + c.unread, 0);

  return (
    <AdminPage
      title="Messages"
      description={permissionNote(session.role)}
      actions={
        <>
          <AdminButton
            variant="outline"
            onClick={() => {
              resetMessages();
              setMessages(loadMessages());
              setActive(null);
            }}
            title="Restore the seeded conversations"
          >
            Reset demo
          </AdminButton>
          <AdminButton onClick={() => setComposing(true)}>
            <MessageSquarePlus className="size-4" aria-hidden="true" />
            New message
          </AdminButton>
        </>
      }
    >
      <DemoNotice>
        Messages are shared between the demo accounts on this browser, so a
        message sent as one role appears when you sign in as the other. Stored
        locally only — replaced by Firestore when the backend lands.
      </DemoNotice>

      <div className="grid gap-5 lg:grid-cols-[320px_1fr]">
        {/* Conversation list */}
        <Panel
          title={`Conversations${totalUnread ? ` (${totalUnread} unread)` : ""}`}
          bodyClassName="p-0"
          className={cn(active && "hidden lg:block")}
        >
          <div className="border-b-2 border-ink/12 p-3">
            <div className="relative">
              <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink/45" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search people"
                aria-label="Search conversations"
                className={`${inputClass} pl-9`}
              />
            </div>
          </div>

          <ul className="max-h-[540px] divide-y divide-ink/10 overflow-y-auto">
            {filtered.map((c) => (
              <li key={c.id}>
                <button
                  type="button"
                  onClick={() => setActive(c.id)}
                  className={cn(
                    "flex w-full cursor-pointer items-start gap-3 p-3.5 text-left transition-colors",
                    active === c.id ? "bg-cream-deep" : "hover:bg-cream",
                  )}
                >
                  <span
                    className={cn(
                      "font-display grid size-10 shrink-0 place-items-center rounded-full border-2 border-ink text-xs",
                      c.contact.role === "student"
                        ? "bg-sage text-ink"
                        : c.contact.role === "teacher"
                          ? "bg-green text-white"
                          : c.contact.role === "principal"
                            ? "bg-green-deep text-white"
                            : "bg-gold text-ink",
                    )}
                  >
                    {c.contact.initials}
                  </span>

                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="truncate font-semibold text-ink">
                        {c.contact.name}
                      </span>
                      {c.last && (
                        <span className="shrink-0 text-[11px] text-ink/50">
                          {timeAgo(c.last.minutesAgo)}
                        </span>
                      )}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-ink/60">
                      {c.last ? c.last.body : "No messages yet"}
                    </span>
                  </span>

                  {c.unread > 0 && (
                    <span className="grid size-5 shrink-0 place-items-center rounded-full bg-green-deep text-[10px] font-bold text-white">
                      {c.unread}
                    </span>
                  )}
                </button>
              </li>
            ))}

            {filtered.length === 0 && (
              <li className="p-6 text-center text-sm text-ink/55">
                No conversations yet. Start one with “New message”.
              </li>
            )}
          </ul>
        </Panel>

        {/* Thread */}
        <Panel
          title={current ? current.contact.name : "Select a conversation"}
          description={current?.contact.subtitle}
          bodyClassName="p-0"
          actions={
            current && (
              <div className="flex items-center gap-2">
                <Badge tone={ROLE_TONE[current.contact.role]}>{current.contact.role}</Badge>
                <button
                  type="button"
                  onClick={() => setActive(null)}
                  className="cursor-pointer text-sm font-bold text-ink underline decoration-teal decoration-2 underline-offset-4 lg:hidden"
                >
                  Back
                </button>
              </div>
            )
          }
        >
          {!current ? (
            <p className="p-10 text-center text-ink/55">
              Choose a conversation on the left, or start a new one.
            </p>
          ) : (
            <>
              <div className="max-h-[440px] space-y-3 overflow-y-auto p-5">
                {current.msgs.length === 0 && (
                  <p className="py-8 text-center text-sm text-ink/55">
                    No messages yet — say salam.
                  </p>
                )}

                {current.msgs.map((m) => {
                  const mine = m.fromName === session.name;
                  return (
                    <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
                      <div
                        className={cn(
                          "max-w-[78%] rounded-2xl border-2 border-ink px-4 py-2.5",
                          mine ? "bg-green-deep text-white" : "bg-cream text-ink",
                        )}
                      >
                        {!mine && (
                          <p className="mb-0.5 text-[11px] font-bold text-ink/55">
                            {m.fromName}
                          </p>
                        )}
                        <p className="text-sm leading-relaxed">{m.body}</p>
                        <p
                          className={cn(
                            "mt-1 text-[10px]",
                            mine ? "text-white/60" : "text-ink/45",
                          )}
                        >
                          {timeAgo(m.minutesAgo)}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={endRef} />
              </div>

              <form
                onSubmit={(e) => { e.preventDefault(); send(); }}
                className="flex items-end gap-2 border-t-2 border-ink/12 p-3"
              >
                <label htmlFor="msg" className="sr-only">
                  Message {current.contact.name}
                </label>
                <textarea
                  id="msg"
                  rows={2}
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
                  }}
                  placeholder={`Message ${current.contact.name}…`}
                  className={`${inputClass} resize-none`}
                />
                <AdminButton type="submit" disabled={!draft.trim()}>
                  <Send className="size-4" aria-hidden="true" />
                  <span className="sr-only sm:not-sr-only">Send</span>
                </AdminButton>
              </form>
            </>
          )}
        </Panel>
      </div>

      {/* Who this role may contact */}
      <Panel title="Who you can message" description={permissionNote(session.role)}>
        <div className="flex flex-wrap gap-2">
          {contacts.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => startThread(c)}
              className="flex cursor-pointer items-center gap-2 rounded-full border-2 border-ink bg-white px-3 py-1.5 text-sm font-semibold text-ink transition-colors hover:bg-cream-deep"
            >
              <span className="grid size-6 place-items-center rounded-full bg-cream-deep text-[10px] font-bold">
                {c.initials}
              </span>
              {c.name}
            </button>
          ))}
        </div>

        {session.role === "student" && (
          <p className="mt-4 flex items-start gap-2 rounded-xl border-2 border-ink bg-gold px-4 py-3 text-sm font-semibold text-ink">
            <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            For your safety you can only message your own teacher and the academy
            administration. Student-to-student messaging is not available.
          </p>
        )}

        {session.role === "teacher" && (
          <p className="mt-4 flex items-start gap-2 rounded-xl border-2 border-ink/15 bg-cream px-4 py-3 text-sm text-ink/75">
            <Info className="mt-0.5 size-4 shrink-0 text-green" aria-hidden="true" />
            You can message the students you teach, plus your principal and the
            administration. Students assigned to other teachers are not listed.
          </p>
        )}
      </Panel>

      {/* Compose */}
      <Modal
        open={composing}
        onClose={() => setComposing(false)}
        title="New message"
        description={permissionNote(session.role)}
      >
        <ul className="space-y-2">
          {contacts.map((c) => (
            <li key={c.id}>
              <button
                type="button"
                onClick={() => startThread(c)}
                className="w-full cursor-pointer rounded-xl border-2 border-ink bg-white px-4 py-3 text-left transition-colors hover:bg-cream-deep"
              >
                <span className="flex items-center justify-between gap-3">
                  <span className="font-semibold text-ink">{c.name}</span>
                  <Badge tone={ROLE_TONE[c.role]}>{c.role}</Badge>
                </span>
                <span className="mt-0.5 block text-xs text-ink/55">{c.subtitle}</span>
              </button>
            </li>
          ))}
        </ul>
      </Modal>
    </AdminPage>
  );
}

function permissionNote(role: Role) {
  switch (role) {
    case "admin":
      return "As Super Admin you can message, and read, anyone in the academy.";
    case "principal":
      return "You can message any student or teacher in your branch.";
    case "teacher":
      return "You can message the students you teach, and academy staff.";
    case "student":
      return "You can message your own teacher and the academy administration.";
  }
}
