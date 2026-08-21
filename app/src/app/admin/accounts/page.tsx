"use client";

/**
 * Portal accounts — the real sign-in credentials, not the demo roster.
 *
 * The Teachers and Students pages manage academic records. This page manages
 * who can actually log in: creating a Firebase credential plus the /users
 * profile that gives it a role, and editing or removing existing ones.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CheckCircle2, KeyRound, Pencil, Plus, RefreshCw, Search, ShieldCheck, Trash2,
} from "lucide-react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";
import {
  createAccount, deleteAccount, listUsers, updateAccount,
  type DirectoryUser, type Role,
} from "@/lib/admin/auth";
import { useSession } from "@/lib/admin/session-context";
import {
  AdminButton, AdminPage, Badge, Field, Panel, Table, Td, Tr, inputClass,
} from "@/components/admin/ui";
import { ConfirmModal, Modal } from "@/components/admin/Modal";

const ROLE_TONE: Record<Role, "greenDeep" | "gold" | "teal" | "sage"> = {
  admin: "greenDeep",
  principal: "gold",
  teacher: "teal",
  student: "sage",
};

const ROLE_LABEL: Record<Role, string> = {
  admin: "Admin",
  principal: "Principal",
  teacher: "Teacher",
  student: "Student",
};

const BRANCHES = ["Head Office", "Lahore Campus", "Karachi Campus", "Online"];

/** Firebase codes, translated into something a person can act on. */
function friendly(err: unknown, fallback: string) {
  const code = (err as { code?: string })?.code ?? "";
  switch (code) {
    case "auth/email-already-in-use":
      return "That email already has an account.";
    case "auth/invalid-email":
      return "Please enter a valid email address.";
    case "auth/weak-password":
      return "Password must be at least 6 characters.";
    case "permission-denied":
      return "Your account is not permitted to make this change. Only an Admin can modify an Admin account or change anyone's role.";
    case "auth/network-request-failed":
      return "Could not reach the server. Please check your connection.";
    default:
      return (err as Error)?.message || fallback;
  }
}

type Draft = {
  name: string;
  email: string;
  password: string;
  role: Exclude<Role, "admin">;
  title: string;
  branch: string;
};

const EMPTY_DRAFT: Draft = {
  name: "",
  email: "",
  password: "",
  role: "student",
  title: "",
  branch: "Lahore Campus",
};

export default function AccountsPage() {
  const { session } = useSession();
  const [rows, setRows] = useState<DirectoryUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [query, setQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | Role>("all");
  const [toast, setToast] = useState("");

  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [editing, setEditing] = useState<DirectoryUser | null>(null);
  const [removing, setRemoving] = useState<DirectoryUser | null>(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");

  const canManage = session?.role === "admin" || session?.role === "principal";
  const isAdmin = session?.role === "admin";

  /**
   * A principal may not modify an Admin account — that is enforced by the
   * security rules, so the UI has to say so rather than let the save fail.
   */
  const mayEdit = (u: DirectoryUser) => isAdmin || u.role !== "admin";

  const refresh = useCallback(async () => {
    setLoading(true);
    setLoadError("");
    try {
      setRows(await listUsers());
    } catch (err) {
      setLoadError(friendly(err, "Could not load accounts."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (session) void refresh();
  }, [session, refresh]);

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(""), 4000);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((u) => {
      const matchesQuery =
        !q || u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
      return matchesQuery && (roleFilter === "all" || u.role === roleFilter);
    });
  }, [rows, query, roleFilter]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { admin: 0, principal: 0, teacher: 0, student: 0 };
    rows.forEach((u) => (c[u.role] = (c[u.role] ?? 0) + 1));
    return c;
  }, [rows]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");

    if (!draft.name.trim() || !draft.email.trim()) {
      setFormError("Name and email are both required.");
      return;
    }
    if (draft.password.length < 6) {
      setFormError("Password must be at least 6 characters.");
      return;
    }

    setBusy(true);
    try {
      await createAccount({
        email: draft.email,
        password: draft.password,
        name: draft.name,
        role: draft.role,
        title: draft.title.trim() || undefined,
        branch: draft.branch,
      });
      setCreating(false);
      setDraft(EMPTY_DRAFT);
      flash(`${draft.name} can now sign in as a ${ROLE_LABEL[draft.role].toLowerCase()}.`);
      await refresh();
    } catch (err) {
      setFormError(friendly(err, "Could not create the account."));
    } finally {
      setBusy(false);
    }
  }

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setFormError("");
    setBusy(true);

    try {
      const before = rows.find((r) => r.uid === editing.uid);

      // Send only what actually moved. Writing `role` on every save makes an
      // ordinary rename look like a role change to the security rules, which
      // then refuse edits a principal is otherwise allowed to make.
      const changes: Parameters<typeof updateAccount>[1] = {};
      if (editing.name !== before?.name) changes.name = editing.name;
      if (editing.title !== before?.title) changes.title = editing.title;
      if (editing.branch !== before?.branch) changes.branch = editing.branch;
      if (editing.role !== before?.role) changes.role = editing.role;

      if (Object.keys(changes).length === 0) {
        setEditing(null);
        setBusy(false);
        return;
      }

      await updateAccount(editing.uid, changes);
      setEditing(null);
      flash("Account updated.");
      await refresh();
    } catch (err) {
      setFormError(friendly(err, "Could not save the changes."));
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!removing) return;
    try {
      await deleteAccount(removing.uid);
      flash(
        `Portal access removed for ${removing.name}. Delete their sign-in from the Firebase console to free the email.`,
      );
      await refresh();
    } catch (err) {
      flash(friendly(err, "Could not remove the account."));
    }
  }

  async function sendReset(user: DirectoryUser) {
    try {
      await sendPasswordResetEmail(auth, user.email);
      flash(`Password reset link sent to ${user.email}.`);
    } catch (err) {
      flash(friendly(err, "Could not send the reset email."));
    }
  }

  if (!canManage) {
    return (
      <AdminPage title="Portal accounts" description="Manage who can sign in.">
        <Panel>
          <p className="text-ink/70">
            Only Admin and Principal accounts may manage portal sign-ins.
          </p>
        </Panel>
      </AdminPage>
    );
  }

  return (
    <AdminPage
      title="Portal accounts"
      description="Create sign-ins for teachers and students, and manage existing ones."
      actions={
        <div className="flex flex-wrap gap-2">
          <AdminButton variant="outline" onClick={() => void refresh()}>
            <RefreshCw className="size-4" aria-hidden="true" />
            Refresh
          </AdminButton>
          <AdminButton
            onClick={() => {
              setDraft(EMPTY_DRAFT);
              setFormError("");
              setCreating(true);
            }}
          >
            <Plus className="size-4" aria-hidden="true" />
            New account
          </AdminButton>
        </div>
      }
    >
      {toast && (
        <p
          role="status"
          className="flex items-center gap-2 rounded-xl border-2 border-ink bg-teal px-4 py-3 text-sm font-semibold text-ink"
        >
          <CheckCircle2 className="size-4 shrink-0" aria-hidden="true" />
          {toast}
        </p>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {(["admin", "principal", "teacher", "student"] as const).map((r) => (
          <Panel key={r} bodyClassName="p-4">
            <p className="text-sm font-bold text-ink/60">{ROLE_LABEL[r]}s</p>
            <p className="font-display mt-1 text-3xl text-ink">{counts[r] ?? 0}</p>
          </Panel>
        ))}
      </div>

      <Panel bodyClassName="p-4">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink/45"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name or email"
              aria-label="Search accounts"
              className={`${inputClass} pl-9`}
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as "all" | Role)}
            aria-label="Filter by role"
            className={`${inputClass} sm:w-52`}
          >
            <option value="all">All roles</option>
            <option value="admin">Admin</option>
            <option value="principal">Principal</option>
            <option value="teacher">Teacher</option>
            <option value="student">Student</option>
          </select>
        </div>
      </Panel>

      {loadError && (
        <p
          role="alert"
          className="rounded-xl border-2 border-red-700 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800"
        >
          {loadError}
        </p>
      )}

      <Panel
        title={
          loading
            ? "Loading accounts…"
            : `${filtered.length} account${filtered.length === 1 ? "" : "s"}`
        }
        bodyClassName="p-0"
      >
        <Table
          head={["Person", "Email", "Role", "Branch", "Actions"]}
          empty={!loading && filtered.length === 0}
        >
          {filtered.map((u) => (
            <Tr key={u.uid}>
              <Td label="Person">
                <div className="flex items-center gap-3">
                  <span className="font-display grid size-9 shrink-0 place-items-center rounded-full border-2 border-ink bg-green text-xs text-white">
                    {u.avatarInitials}
                  </span>
                  <div>
                    <p className="font-semibold text-ink">{u.name}</p>
                    <p className="text-xs text-ink/55">{u.title}</p>
                  </div>
                </div>
              </Td>
              <Td label="Email" className="text-ink/80">
                {u.email}
              </Td>
              <Td label="Role">
                <Badge tone={ROLE_TONE[u.role]}>{ROLE_LABEL[u.role]}</Badge>
              </Td>
              <Td label="Branch" className="text-ink/70">
                {u.branch}
              </Td>
              <Td label="Actions">
                <div className="flex flex-wrap gap-2">
                  <AdminButton
                    size="sm"
                    variant="outline"
                    disabled={!mayEdit(u)}
                    title={
                      mayEdit(u)
                        ? undefined
                        : "Only an Admin can change an Admin account."
                    }
                    onClick={() => {
                      setFormError("");
                      setEditing(u);
                    }}
                  >
                    <Pencil className="size-3.5" aria-hidden="true" />
                    Edit
                  </AdminButton>
                  <AdminButton size="sm" variant="outline" onClick={() => void sendReset(u)}>
                    <KeyRound className="size-3.5" aria-hidden="true" />
                    Reset password
                  </AdminButton>
                  {isAdmin && u.uid !== session?.uid && (
                    <AdminButton size="sm" variant="danger" onClick={() => setRemoving(u)}>
                      <Trash2 className="size-3.5" aria-hidden="true" />
                      Remove
                    </AdminButton>
                  )}
                </div>
              </Td>
            </Tr>
          ))}
        </Table>
      </Panel>

      {/* ------------------------------ Create ------------------------------ */}
      <Modal
        open={creating}
        onClose={() => setCreating(false)}
        title="New portal account"
        description="Creates the sign-in and the profile that gives it a role."
      >
        <form id="create-account" onSubmit={handleCreate} noValidate className="space-y-4">
          <Field label="Full name">
            <input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="Ustadha Ayesha Siddiqa"
              className={inputClass}
            />
          </Field>

          <Field label="Email address" hint="This is what they sign in with.">
            <input
              type="email"
              value={draft.email}
              onChange={(e) => setDraft({ ...draft, email: e.target.value })}
              placeholder="teacher02@quranmubarak.com"
              autoComplete="off"
              className={inputClass}
            />
          </Field>

          <Field
            label="Temporary password"
            hint="At least 6 characters. Share it securely and ask them to change it."
          >
            <input
              type="text"
              value={draft.password}
              onChange={(e) => setDraft({ ...draft, password: e.target.value })}
              autoComplete="new-password"
              className={inputClass}
            />
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Role">
              <select
                value={draft.role}
                onChange={(e) =>
                  setDraft({ ...draft, role: e.target.value as Draft["role"] })
                }
                className={inputClass}
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                {isAdmin && <option value="principal">Principal</option>}
              </select>
            </Field>

            <Field label="Branch">
              <select
                value={draft.branch}
                onChange={(e) => setDraft({ ...draft, branch: e.target.value })}
                className={inputClass}
              >
                {BRANCHES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Job title" hint="Optional. Defaults to their role.">
            <input
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
              placeholder="Tajweed Specialist"
              className={inputClass}
            />
          </Field>

          {formError && (
            <p
              role="alert"
              className="rounded-xl border-2 border-red-700 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800"
            >
              {formError}
            </p>
          )}

          <p className="flex items-start gap-2 rounded-xl border-2 border-ink/15 bg-cream px-4 py-3 text-xs text-ink/70">
            <ShieldCheck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            You stay signed in as yourself — the new credential is registered on a
            separate connection.
          </p>
        </form>

        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <AdminButton variant="outline" type="button" onClick={() => setCreating(false)}>
            Cancel
          </AdminButton>
          <AdminButton type="submit" form="create-account" disabled={busy}>
            {busy ? "Creating…" : "Create account"}
          </AdminButton>
        </div>
      </Modal>

      {/* ------------------------------- Edit ------------------------------- */}
      <Modal
        open={!!editing}
        onClose={() => setEditing(null)}
        title="Edit account"
        description={editing?.email}
      >
        {editing && (
          <>
            <form id="edit-account" onSubmit={handleUpdate} noValidate className="space-y-4">
              <Field label="Full name">
                <input
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                  className={inputClass}
                />
              </Field>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  label="Role"
                  hint={isAdmin ? undefined : "Only Admin can change roles."}
                >
                  <select
                    value={editing.role}
                    disabled={!isAdmin || editing.uid === session?.uid}
                    onChange={(e) =>
                      setEditing({ ...editing, role: e.target.value as Role })
                    }
                    className={inputClass}
                  >
                    <option value="student">Student</option>
                    <option value="teacher">Teacher</option>
                    <option value="principal">Principal</option>
                    <option value="admin">Admin</option>
                  </select>
                </Field>

                <Field label="Branch">
                  <select
                    value={editing.branch}
                    onChange={(e) => setEditing({ ...editing, branch: e.target.value })}
                    className={inputClass}
                  >
                    {BRANCHES.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Job title">
                <input
                  value={editing.title}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                  className={inputClass}
                />
              </Field>

              {formError && (
                <p
                  role="alert"
                  className="rounded-xl border-2 border-red-700 bg-red-50 px-4 py-3 text-sm font-semibold text-red-800"
                >
                  {formError}
                </p>
              )}

              <p className="rounded-xl border-2 border-ink/15 bg-cream px-4 py-3 text-xs text-ink/70">
                Email addresses are part of the sign-in credential and can only be
                changed by the account holder, or from the Firebase console.
              </p>
            </form>

            <div className="mt-5 flex flex-wrap justify-end gap-3">
              <AdminButton variant="outline" type="button" onClick={() => setEditing(null)}>
                Cancel
              </AdminButton>
              <AdminButton type="submit" form="edit-account" disabled={busy}>
                {busy ? "Saving…" : "Save changes"}
              </AdminButton>
            </div>
          </>
        )}
      </Modal>

      <ConfirmModal
        open={!!removing}
        onClose={() => setRemoving(null)}
        onConfirm={() => void handleDelete()}
        danger
        confirmLabel="Remove access"
        title={`Remove ${removing?.name ?? ""}?`}
        body="Their portal profile is deleted and they lose access immediately. The sign-in credential itself stays in Firebase Authentication until deleted from the console."
      />
    </AdminPage>
  );
}
