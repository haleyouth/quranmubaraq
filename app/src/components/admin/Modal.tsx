"use client";

import { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { AdminButton } from "@/components/admin/ui";

export function Modal({
  open,
  onClose,
  title,
  description,
  footer,
  size = "md",
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  footer?: React.ReactNode;
  size?: "md" | "lg";
  children: React.ReactNode;
}) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";

    // Move focus into the dialog for keyboard and screen-reader users
    panelRef.current?.focus();

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="absolute inset-0 bg-ink/60" onClick={onClose} aria-hidden="true" />

      <div
        ref={panelRef}
        tabIndex={-1}
        className={`relative max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border-4 border-ink bg-white hard-shadow-lg focus:outline-none sm:rounded-2xl ${
          size === "lg" ? "sm:max-w-4xl" : "sm:max-w-lg"
        }`}
      >
        <header className="flex items-start justify-between gap-4 border-b-2 border-ink/12 px-5 py-4">
          <div>
            <h2 className="font-display text-xl text-ink">{title}</h2>
            {description && <p className="mt-0.5 text-sm text-ink/65">{description}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-full border-2 border-ink bg-white transition-colors hover:bg-cream-deep"
          >
            <X className="size-4" />
          </button>
        </header>

        <div className="px-5 py-5">{children}</div>

        {footer && (
          <footer className="flex flex-wrap justify-end gap-3 border-t-2 border-ink/12 px-5 py-4">
            {footer}
          </footer>
        )}
      </div>
    </div>
  );
}

/** Destructive-action confirmation with a typed-phrase guard. */
export function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title,
  body,
  confirmLabel = "Confirm",
  danger = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  body: string;
  confirmLabel?: string;
  danger?: boolean;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <>
          <AdminButton variant="outline" onClick={onClose}>
            Cancel
          </AdminButton>
          <AdminButton
            variant={danger ? "danger" : "primary"}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmLabel}
          </AdminButton>
        </>
      }
    >
      <p className="text-ink/75">{body}</p>
    </Modal>
  );
}
