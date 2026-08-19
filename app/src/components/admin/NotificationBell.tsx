"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  Bell, BookOpen, CalendarClock, CheckCheck, CreditCard,
  MessageCircle, MessageSquareWarning, Plane,
} from "lucide-react";
import type { Session } from "@/lib/admin/demo-auth";
import {
  buildNotifications, markAllRead, markRead, readIds,
  subscribeNotifications, timeAgoShort,
  type Notification, type NotificationKind,
} from "@/lib/admin/notifications";
import { cn } from "@/lib/utils";

const ICON: Record<NotificationKind, typeof Bell> = {
  message: MessageCircle,
  class: CalendarClock,
  attendance: BookOpen,
  complaint: MessageSquareWarning,
  leave: Plane,
  finance: CreditCard,
};

const TONE: Record<NotificationKind, string> = {
  message: "bg-green text-white",
  class: "bg-green-deep text-white",
  attendance: "bg-gold text-ink",
  complaint: "bg-red-700 text-white",
  leave: "bg-sage text-ink",
  finance: "bg-teal text-ink",
};

export function NotificationBell({ session }: { session: Session }) {
  const [open, setOpen] = useState(false);
  const [all, setAll] = useState<Notification[]>([]);
  const [read, setRead] = useState<Set<string>>(new Set());
  const ref = useRef<HTMLDivElement>(null);

  // Built on the client: the feed depends on the clock and on local state
  useEffect(() => {
    const refresh = () => {
      setAll(buildNotifications(session.role, session.name));
      setRead(readIds());
    };
    refresh();

    const unsubscribe = subscribeNotifications(refresh);
    // Keeps "class in 12 minutes" honest as time passes
    const tick = window.setInterval(refresh, 60_000);
    return () => {
      unsubscribe();
      window.clearInterval(tick);
    };
  }, [session.role, session.name]);

  // Close on outside click and on Escape
  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const unread = useMemo(() => all.filter((n) => !read.has(n.id)), [all, read]);
  const urgent = unread.some((n) => n.urgent);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={
          unread.length
            ? `Notifications, ${unread.length} unread`
            : "Notifications, none unread"
        }
        aria-expanded={open}
        aria-haspopup="true"
        className={cn(
          "relative grid size-11 cursor-pointer place-items-center rounded-full border-2 transition-colors sm:size-9",
          open
            ? "border-ink bg-ink text-cream"
            : "border-ink bg-white text-ink hover:bg-cream-deep",
        )}
      >
        <Bell className="size-4" aria-hidden="true" />

        {unread.length > 0 && (
          <span
            className={cn(
              "absolute -top-1.5 -right-1.5 grid min-w-5 place-items-center rounded-full border-2 border-ink px-1 text-[10px] font-bold tabular-nums",
              urgent ? "bg-red-700 text-white" : "bg-gold text-ink",
            )}
          >
            {unread.length > 9 ? "9+" : unread.length}
          </span>
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Notifications"
          className="absolute right-0 z-50 mt-2 w-[22rem] max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border-2 border-ink bg-white hard-shadow"
        >
          <header className="flex items-center justify-between gap-3 border-b-2 border-ink/12 px-4 py-3">
            <p className="font-display text-base text-ink">
              Notifications
              {unread.length > 0 && (
                <span className="ml-1.5 text-sm font-semibold text-ink/55">
                  {unread.length} new
                </span>
              )}
            </p>
            {unread.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  markAllRead(all);
                  setRead(readIds());
                }}
                className="flex cursor-pointer items-center gap-1 text-xs font-bold text-ink underline decoration-teal decoration-2 underline-offset-4 hover:text-green-deep"
              >
                <CheckCheck className="size-3.5" aria-hidden="true" />
                Mark all read
              </button>
            )}
          </header>

          <ul className="max-h-[26rem] divide-y divide-ink/10 overflow-y-auto">
            {all.length === 0 && (
              <li className="px-4 py-10 text-center">
                <Bell className="mx-auto size-7 text-ink/25" aria-hidden="true" />
                <p className="mt-2 font-semibold text-ink">You are all caught up</p>
                <p className="mt-0.5 text-sm text-ink/55">
                  New messages and classes will appear here.
                </p>
              </li>
            )}

            {all.map((n) => {
              const Icon = ICON[n.kind];
              const isRead = read.has(n.id);
              return (
                <li key={n.id}>
                  <Link
                    href={n.href}
                    onClick={() => {
                      markRead(n.id);
                      setRead(readIds());
                      setOpen(false);
                    }}
                    className={cn(
                      "flex gap-3 px-4 py-3 transition-colors hover:bg-cream",
                      !isRead && "bg-cream-deep/40",
                    )}
                  >
                    <span
                      className={cn(
                        "grid size-8 shrink-0 place-items-center rounded-full border-2 border-ink",
                        TONE[n.kind],
                      )}
                    >
                      <Icon className="size-3.5" aria-hidden="true" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline justify-between gap-2">
                        <span
                          className={cn(
                            "truncate text-sm text-ink",
                            isRead ? "font-medium" : "font-bold",
                          )}
                        >
                          {n.title}
                        </span>
                        <span className="shrink-0 text-[11px] text-ink/45">
                          {timeAgoShort(n.minutesAgo)}
                        </span>
                      </span>
                      <span className="mt-0.5 block truncate text-xs text-ink/65">
                        {n.body}
                      </span>
                    </span>

                    {!isRead && (
                      <span
                        aria-hidden="true"
                        className={cn(
                          "mt-1.5 size-2 shrink-0 rounded-full",
                          n.urgent ? "bg-red-700" : "bg-green-deep",
                        )}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
