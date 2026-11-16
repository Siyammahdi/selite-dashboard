"use client";

import { useState } from "react";
import { Drawer, DrawerActions } from "@/components/ui/drawer";
import { TextInput } from "@/components/ui/form-fields";
import { PageHeader } from "@/components/ui/page-header";
import { addRole, useDashboard } from "@/lib/stores/dashboard";
import { pushToast } from "@/lib/stores/ui";

const PERMS = ["orders", "products", "finance", "purchases", "roles", "notes", "settings"] as const;

export function RolesView() {
  const { roles } = useDashboard();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string[]>(["orders", "notes"]);
  const [error, setError] = useState("");

  function createRole() {
    if (!name.trim()) {
      setError("Role name is required");
      pushToast("Role name required", "error");
      return;
    }
    if (!selected.length) {
      pushToast("Pick at least one permission", "error");
      return;
    }
    addRole({
      id: `ROLE-${Date.now()}`,
      name: name.trim(),
      permissions: selected,
      members: 0,
    });
    setName("");
    setSelected(["orders", "notes"]);
    setError("");
    setOpen(false);
    pushToast("Role created");
  }

  return (
    <div className="mx-auto flex w-full max-w-[1132px] flex-col gap-4">
      <PageHeader
        title="Roles & Permission"
        actions={[
          {
            label: "Add Role",
            onClick: () => {
              setName("");
              setSelected(["orders", "notes"]);
              setError("");
              setOpen(true);
            },
          },
        ]}
      />

      <div className="grid gap-4 md:grid-cols-2">
        {roles.map((role, index) => (
          <article
            key={role.id}
            className="animate-fade-up rounded-xl border border-stone bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-md"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink">{role.name}</h2>
              <span className="rounded-full bg-snow px-2 py-1 text-xs text-ink/70">{role.members} members</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {role.permissions.map((perm) => (
                <span key={perm} className="rounded-md bg-lime/60 px-2 py-1 text-xs font-medium text-ink">
                  {perm}
                </span>
              ))}
            </div>
          </article>
        ))}
      </div>

      <Drawer
        open={open}
        title="Add Role"
        onClose={() => setOpen(false)}
        footer={<DrawerActions onSave={createRole} onCancel={() => setOpen(false)} saveLabel="Create role" />}
      >
        <div className="flex flex-col gap-3 pb-4">
          <TextInput label="Role name" required value={name} onChange={setName} error={error} />
          <div className="flex flex-col gap-2">
            <p className="text-sm text-ink">Permissions</p>
            <div className="flex flex-wrap gap-2">
              {PERMS.map((perm) => {
                const active = selected.includes(perm);
                return (
                  <button
                    key={perm}
                    type="button"
                    onClick={() =>
                      setSelected((prev) => (active ? prev.filter((p) => p !== perm) : [...prev, perm]))
                    }
                    className={`rounded-md border px-3 py-1.5 text-xs transition ${
                      active ? "border-forest bg-forest text-white" : "border-stone hover:bg-snow"
                    }`}
                  >
                    {perm}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </Drawer>
    </div>
  );
}
