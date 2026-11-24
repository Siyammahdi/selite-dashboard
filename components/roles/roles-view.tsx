"use client";

import { useMemo, useState } from "react";
import { Drawer, DrawerActions } from "@/components/ui/drawer";
import { EmptyState } from "@/components/ui/empty-state";
import { ChevronRightIcon } from "@/components/ui/icons";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { SearchField } from "@/components/ui/search-field";
import { PasswordInput, SelectField, TextInput } from "@/components/ui/form-fields";
import { Toggle } from "@/components/ui/toggle";
import { paginate } from "@/lib/metrics";
import { addTeamMember, deleteTeamMember, updateTeamMember, useDashboard } from "@/lib/stores/dashboard";
import { pushToast } from "@/lib/stores/ui";
import { ACCESS_MODULES, ACCESS_MODULE_LABELS, type AccessModule, type TeamMember } from "@/lib/types";

const PAGE_SIZE = 10;

function maskPassword(password: string) {
  return "•".repeat(Math.min(10, Math.max(6, password.length)));
}

function accessSummary(access: AccessModule[]) {
  if (access.length === ACCESS_MODULES.length) return "All";
  if (access.length === 0) return "None";
  return access.map((a) => ACCESS_MODULE_LABELS[a]).join(", ");
}

/** Guards against data saved by an older version of this page, where `access` was a single string. */
function normalizeAccess(value: unknown): AccessModule[] {
  const isModule = (v: unknown): v is AccessModule => (ACCESS_MODULES as readonly unknown[]).includes(v);
  if (Array.isArray(value)) return value.filter(isModule);
  if (isModule(value)) return [value];
  return [];
}

export function RolesView() {
  const { teamMembers: rawTeamMembers } = useDashboard();
  const teamMembers = useMemo(
    () => rawTeamMembers.map((m) => ({ ...m, access: normalizeAccess(m.access) })),
    [rawTeamMembers],
  );
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = selectedId ? (teamMembers.find((m) => m.id === selectedId) ?? null) : null;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return teamMembers;
    return teamMembers.filter(
      (m) => m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.phone.includes(q),
    );
  }, [teamMembers, query]);

  const paged = paginate(filtered, page, PAGE_SIZE);

  return (
    <div className="flex w-full flex-col gap-4">
      <PageHeader
        title="Roles & Permissions"
        actions={[
          {
            label: "Add User",
            onClick: () => {
              setSelectedId(null);
              setCreateOpen(true);
            },
          },
        ]}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink/60">
          {teamMembers.length} user{teamMembers.length === 1 ? "" : "s"} · click a row to edit access
        </p>
        <SearchField value={query} onChange={(v) => { setQuery(v); setPage(1); }} placeholder="Search users…" />
      </div>

      {paged.items.length === 0 ? (
        <EmptyState
          title={query ? "No users match your search" : "No users yet"}
          description="Add teammates and set what part of the dashboard they can access."
          action={query ? undefined : { label: "Add User", onClick: () => setCreateOpen(true) }}
        />
      ) : (
        <>
          <div className="overflow-x-auto rounded-lg border border-stone bg-white">
            <table className="w-full min-w-[980px] border-collapse text-sm">
              <thead>
                <tr className="bg-[#ecece4] text-left text-forest">
                  <th className="px-4 py-3 font-normal">Name</th>
                  <th className="px-4 py-3 font-normal">Email</th>
                  <th className="px-4 py-3 font-normal">Phn Number</th>
                  <th className="px-4 py-3 font-normal">Password</th>
                  <th className="px-4 py-3 font-normal">Access</th>
                  <th className="px-4 py-3 font-normal">Active</th>
                  <th className="px-4 py-3 font-normal">Action</th>
                </tr>
              </thead>
              <tbody>
                {paged.items.map((member) => (
                  <tr key={member.id} className="border-t border-stone transition hover:bg-snow/80">
                    <td className="px-4 py-3 font-semibold text-ink">{member.name}</td>
                    <td className="px-4 py-3 text-forest">{member.email}</td>
                    <td className="px-4 py-3 text-ink">{member.phone}</td>
                    <td className="px-4 py-3 font-mono text-ink/60" aria-label="Password hidden">
                      {maskPassword(member.password)}
                    </td>
                    <td className="px-4 py-3 text-ink">{accessSummary(member.access)}</td>
                    <td className="px-4 py-3">
                      <Toggle
                        checked={member.active}
                        label={`Toggle ${member.name}`}
                        onChange={(next) => {
                          updateTeamMember(member.id, { active: next });
                          pushToast(next ? "User activated" : "User deactivated", "info");
                        }}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        className="text-ink transition hover:translate-x-0.5"
                        aria-label={`Open ${member.name}`}
                        onClick={() => setSelectedId(member.id)}
                      >
                        <ChevronRightIcon />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination
            page={paged.page}
            totalPages={paged.totalPages}
            onChange={setPage}
            helper={`${paged.total} user${paged.total === 1 ? "" : "s"}`}
          />
        </>
      )}

      <UserDrawer open={createOpen} onClose={() => setCreateOpen(false)} />
      <UserDrawer open={!!selected} member={selected} onClose={() => setSelectedId(null)} />
    </div>
  );
}

function UserDrawer({
  open,
  member,
  onClose,
}: {
  open: boolean;
  member?: TeamMember | null;
  onClose: () => void;
}) {
  if (!open) return null;
  return <UserDrawerForm key={member?.id ?? "create"} member={member} onClose={onClose} />;
}

function UserDrawerForm({ member, onClose }: { member?: TeamMember | null; onClose: () => void }) {
  const { teamMembers: rawTeamMembers } = useDashboard();
  const teamMembers = useMemo(
    () => rawTeamMembers.map((m) => ({ ...m, access: normalizeAccess(m.access) })),
    [rawTeamMembers],
  );
  const editing = Boolean(member);
  const [name, setName] = useState(member?.name ?? "");
  const [email, setEmail] = useState(member?.email ?? "");
  const [phone, setPhone] = useState(member?.phone ?? "");
  const [password, setPassword] = useState(member?.password ?? "");
  const [access, setAccess] = useState<AccessModule[]>(member?.access ?? ["orders"]);
  const [active, setActive] = useState(member?.active ?? true);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const hasFullAccess = (list: AccessModule[]) => list.length === ACCESS_MODULES.length;

  function toggleModule(mod: AccessModule) {
    setAccess((prev) => (prev.includes(mod) ? prev.filter((m) => m !== mod) : [...prev, mod]));
  }

  function toggleAll() {
    setAccess((prev) => (hasFullAccess(prev) ? [] : [...ACCESS_MODULES]));
  }

  function validate() {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Name is required";
    if (!email.trim()) next.email = "Email is required";
    if (!phone.trim()) next.phone = "Phone number is required";
    if (!password.trim() || password.trim().length < 6) next.password = "At least 6 characters";
    if (!access.length) next.access = "Pick at least one access area";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function isLastActiveAdmin(id: string) {
    const otherAdmins = teamMembers.filter((m) => m.id !== id && hasFullAccess(m.access) && m.active);
    return otherAdmins.length === 0;
  }

  function handleSave() {
    if (!validate()) {
      pushToast("Complete all required fields", "error");
      return;
    }
    if (
      editing &&
      member &&
      hasFullAccess(member.access) &&
      (!hasFullAccess(access) || !active) &&
      isLastActiveAdmin(member.id)
    ) {
      pushToast("At least one active user needs full access", "error");
      return;
    }

    const payload: TeamMember = {
      id: member?.id ?? `USER-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password: password.trim(),
      access,
      active,
    };

    if (editing && member) {
      updateTeamMember(member.id, payload);
      pushToast("User updated");
    } else {
      addTeamMember(payload);
      pushToast("User added");
    }
    onClose();
  }

  function handleDelete() {
    if (!member) return;
    if (hasFullAccess(member.access) && isLastActiveAdmin(member.id)) {
      pushToast("At least one active user needs full access", "error");
      return;
    }
    if (!window.confirm(`Delete user “${member.name}”?`)) return;
    deleteTeamMember(member.id);
    pushToast("User deleted", "info");
    onClose();
  }

  return (
    <Drawer
      open
      title="User Details"
      onClose={onClose}
      footer={
        <DrawerActions
          onSave={handleSave}
          onCancel={onClose}
          onDelete={editing ? handleDelete : undefined}
          saveLabel={editing ? "Save Change" : "Add User"}
          deleteLabel="Delete"
        />
      }
    >
      <div className="flex flex-col gap-3 pb-4">
        <TextInput label="Name" required value={name} onChange={setName} error={errors.name} />
        <div className="grid grid-cols-2 gap-4">
          <TextInput label="Email" required type="email" value={email} onChange={setEmail} error={errors.email} />
          <TextInput label="Phone Number" required value={phone} onChange={setPhone} error={errors.phone} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <PasswordInput label="Password" required value={password} onChange={setPassword} error={errors.password} />
          <SelectField
            label="Activity"
            value={active ? "active" : "inactive"}
            onChange={(v) => setActive(v === "active")}
            options={[
              { value: "active", label: "Active" },
              { value: "inactive", label: "Inactive" },
            ]}
          />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-sm text-ink">Access</p>
          <p className="text-xs text-ink/50">A user can be given more than one part of the dashboard</p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={toggleAll}
              className={`rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                hasFullAccess(access)
                  ? "border-forest bg-forest text-white"
                  : "border-stone bg-white text-ink hover:bg-snow"
              }`}
            >
              <span className="font-medium">All</span>
              <span className={`mt-0.5 block text-xs ${hasFullAccess(access) ? "text-lime/90" : "text-ink/45"}`}>
                {hasFullAccess(access) ? "Allowed" : "Blocked"}
              </span>
            </button>
            {ACCESS_MODULES.map((mod) => {
              const isActive = access.includes(mod);
              return (
                <button
                  key={mod}
                  type="button"
                  onClick={() => toggleModule(mod)}
                  className={`rounded-lg border px-3 py-2.5 text-left text-sm transition ${
                    isActive ? "border-forest bg-forest text-white" : "border-stone bg-white text-ink hover:bg-snow"
                  }`}
                >
                  <span className="font-medium">{ACCESS_MODULE_LABELS[mod]}</span>
                  <span className={`mt-0.5 block text-xs ${isActive ? "text-lime/90" : "text-ink/45"}`}>
                    {isActive ? "Allowed" : "Blocked"}
                  </span>
                </button>
              );
            })}
          </div>
          {errors.access ? <span className="text-xs text-[#d00036]">{errors.access}</span> : null}
        </div>
      </div>
    </Drawer>
  );
}
