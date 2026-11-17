"use client";

import { useMemo, useState } from "react";
import { Drawer, DrawerActions } from "@/components/ui/drawer";
import { EmptyState } from "@/components/ui/empty-state";
import { NumberInput, TextInput } from "@/components/ui/form-fields";
import { PageHeader } from "@/components/ui/page-header";
import { SearchField } from "@/components/ui/search-field";
import {
  addRole,
  deleteRole,
  updateRole,
  useDashboard,
} from "@/lib/stores/dashboard";
import { pushToast } from "@/lib/stores/ui";
import type { Role } from "@/lib/types";

const PERMS = [
  { id: "orders", label: "Orders" },
  { id: "products", label: "Products" },
  { id: "finance", label: "Finance" },
  { id: "purchases", label: "Purchases" },
  { id: "roles", label: "Roles" },
  { id: "notes", label: "Notes" },
  { id: "settings", label: "Settings" },
] as const;

export function RolesView() {
  const { roles } = useDashboard();
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId ? (roles.find((r) => r.id === selectedId) ?? null) : null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return roles;
    return roles.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.permissions.some((p) => p.toLowerCase().includes(q)),
    );
  }, [roles, query]);

  return (
    <div className="mx-auto flex w-full max-w-[1132px] flex-col gap-4">
      <PageHeader
        title="Roles & Permission"
        actions={[
          {
            label: "Add Role",
            onClick: () => {
              setSelectedId(null);
              setCreateOpen(true);
            },
          },
        ]}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink/60">
          {roles.length} role{roles.length === 1 ? "" : "s"} · click a card to edit permissions
        </p>
        <SearchField value={query} onChange={setQuery} placeholder="Search roles…" />
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title={query ? "No roles match your search" : "No roles yet"}
          description="Define who can manage orders, finance, catalog, and notes."
          action={
            query
              ? undefined
              : {
                  label: "Add Role",
                  onClick: () => setCreateOpen(true),
                }
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((role, index) => (
            <article
              key={role.id}
              role="button"
              tabIndex={0}
              onClick={() => setSelectedId(role.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setSelectedId(role.id);
                }
              }}
              className="animate-fade-up cursor-pointer rounded-xl border border-stone bg-white p-5 text-left transition hover:-translate-y-0.5 hover:border-forest/30 hover:shadow-md"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-ink">{role.name}</h2>
                <span className="rounded-full bg-snow px-2 py-1 text-xs text-ink/70">
                  {role.members} member{role.members === 1 ? "" : "s"}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {role.permissions.length ? (
                  role.permissions.map((perm) => (
                    <span key={perm} className="rounded-md bg-lime/60 px-2 py-1 text-xs font-medium text-ink">
                      {perm}
                    </span>
                  ))
                ) : (
                  <span className="text-sm text-ink/50">No permissions assigned</span>
                )}
              </div>
              <p className="mt-4 text-xs text-forest">Edit role →</p>
            </article>
          ))}
        </div>
      )}

      <RoleDrawer open={createOpen} onClose={() => setCreateOpen(false)} />
      <RoleDrawer open={!!selected} role={selected} onClose={() => setSelectedId(null)} />
    </div>
  );
}

function RoleDrawer({
  open,
  role,
  onClose,
}: {
  open: boolean;
  role?: Role | null;
  onClose: () => void;
}) {
  if (!open) return null;
  return <RoleDrawerForm key={role?.id ?? "create"} role={role} onClose={onClose} />;
}

function RoleDrawerForm({ role, onClose }: { role?: Role | null; onClose: () => void }) {
  const editing = Boolean(role);
  const [name, setName] = useState(role?.name ?? "");
  const [members, setMembers] = useState(String(role?.members ?? 0));
  const [selected, setSelected] = useState<string[]>(role?.permissions ?? ["orders", "notes"]);
  const [error, setError] = useState("");

  function handleSave() {
    if (!name.trim()) {
      setError("Role name is required");
      pushToast("Role name required", "error");
      return;
    }
    if (!selected.length) {
      pushToast("Pick at least one permission", "error");
      return;
    }

    const payload: Role = {
      id: role?.id ?? `ROLE-${Date.now()}`,
      name: name.trim(),
      permissions: selected,
      members: Math.max(0, Math.floor(Number(members) || 0)),
    };

    if (editing && role) {
      updateRole(role.id, payload);
      pushToast("Role updated");
    } else {
      addRole(payload);
      pushToast("Role created");
    }
    onClose();
  }

  function handleDelete() {
    if (!role) return;
    if (role.name === "Owner") {
      pushToast("Owner role cannot be deleted", "error");
      return;
    }
    if (!window.confirm(`Delete role “${role.name}”?`)) return;
    deleteRole(role.id);
    pushToast("Role deleted", "info");
    onClose();
  }

  return (
    <Drawer
      open
      title={editing ? "Edit Role" : "Add Role"}
      onClose={onClose}
      footer={
        <DrawerActions
          onSave={handleSave}
          onCancel={onClose}
          onDelete={editing && role?.name !== "Owner" ? handleDelete : undefined}
          saveLabel={editing ? "Save Change" : "Create role"}
          deleteLabel="Delete"
        />
      }
    >
      <div className="flex flex-col gap-3 pb-4">
        <TextInput label="Role name" required value={name} onChange={setName} error={error} />
        <NumberInput label="Members" min={0} value={members} onChange={setMembers} />
        <div className="flex flex-col gap-2">
          <p className="text-sm text-ink">Permissions</p>
          <p className="text-xs text-ink/50">Toggle modules this role can access</p>
          <div className="grid gap-2 sm:grid-cols-2">
            {PERMS.map((perm) => {
              const active = selected.includes(perm.id);
              return (
                <button
                  key={perm.id}
                  type="button"
                  onClick={() =>
                    setSelected((prev) =>
                      active ? prev.filter((p) => p !== perm.id) : [...prev, perm.id],
                    )
                  }
                  className={`rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                    active
                      ? "border-forest bg-forest text-white"
                      : "border-stone bg-white text-ink hover:bg-snow"
                  }`}
                >
                  <span className="font-medium">{perm.label}</span>
                  <span className={`mt-0.5 block text-xs ${active ? "text-lime/90" : "text-ink/45"}`}>
                    {active ? "Allowed" : "Blocked"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Drawer>
  );
}
