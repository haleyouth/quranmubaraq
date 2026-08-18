"use client";

import { ExternalLink, ShieldCheck, Video } from "lucide-react";
import { STATUS_LABEL, type ClassSession } from "@/lib/admin/schedule";
import { Modal } from "@/components/admin/Modal";
import { AdminButton } from "@/components/admin/ui";

/**
 * Confirmation before opening a class link.
 *
 * Until the Zoom Server-to-Server integration lands (CRM plan §5.11), the
 * stored URL is opened directly. Joining is deliberately a confirmed action
 * rather than a bare link so a mis-click never drops someone into a live
 * class with their camera on.
 */
export function JoinClassDialog({
  session,
  onClose,
}: {
  session: ClassSession | null;
  onClose: () => void;
}) {
  if (!session) return null;

  const startsSoon = session.status === "scheduled";

  function join() {
    if (!session) return;
    window.open(session.zoomUrl, "_blank", "noopener,noreferrer");
    onClose();
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Join this class?"
      description={`${session.course} · ${session.start}–${session.end}`}
      footer={
        <>
          <AdminButton variant="outline" onClick={onClose}>
            Cancel
          </AdminButton>
          <AdminButton onClick={join}>
            <Video className="size-4" aria-hidden="true" />
            Join class
          </AdminButton>
        </>
      }
    >
      <dl className="space-y-3 text-sm">
        {[
          ["Course", session.course],
          ["Teacher", session.teacherName],
          ["Student", session.studentName],
          ["Date", new Date(`${session.date}T00:00:00`).toLocaleDateString("en-GB", {
            weekday: "long", day: "numeric", month: "long",
          })],
          ["Time", `${session.start} – ${session.end}`],
          ["Status", STATUS_LABEL[session.status]],
        ].map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 border-b-2 border-ink/10 pb-2">
            <dt className="font-bold text-ink/60">{k}</dt>
            <dd className="text-right text-ink">{v}</dd>
          </div>
        ))}
      </dl>

      {startsSoon && (
        <p className="mt-4 rounded-xl border-2 border-ink bg-gold px-4 py-3 text-sm font-semibold text-ink">
          This class has not started yet. You can open the room early, but your teacher
          may not have joined.
        </p>
      )}

      <p className="mt-4 flex items-start gap-2 rounded-xl border-2 border-ink/15 bg-cream p-3 text-sm text-ink/70">
        <ShieldCheck className="mt-0.5 size-4 shrink-0 text-green" aria-hidden="true" />
        The class opens in a new tab. Please join with your camera on and your
        microphone muted until your teacher asks you to speak.
      </p>

      <p className="mt-3 flex items-center gap-1.5 text-xs text-ink/50">
        <ExternalLink className="size-3" aria-hidden="true" />
        <span className="truncate font-mono">{session.zoomUrl}</span>
      </p>
    </Modal>
  );
}
