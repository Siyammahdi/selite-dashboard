"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { addRole, useDashboard } from "@/lib/stores/dashboard";
import { pushToast } from "@/lib/stores/ui";

const PERMS = ["orders", "products", "finance", "purchases", "roles", "notes", "settings"] as const;

export function RolesView() {
  const { roles } = useDashboard();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<string[]>(["orders", "notes"]);

  function createRole() {
    if (!name.trim()) {
      pushToast("Role name required", "error");
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
    setOpen(false);
    pushToast("Role created");
  }

  return (
    <div className="mx-auto flex w-full max-w-[1132px] flex-col gap-4">
      <PageHeader title="Roles & Permission" actions={[{ label: "Add Role", onClick: () => setOpen(true) }]} />

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

      <Modal open={open} title="Add Role" onClose={() => setOpen(false)}>
        <div className="space-y-3">
          <label className="block text-sm">
            Role name
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 h-10 w-full rounded-md border border-stone px-3"
            />
          </label>
          <div>
            <p className="mb-2 text-sm">Permissions</p>
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
          <div className="flex justify-end gap-2">
            <button type="button" className="rounded-md border border-stone px-4 py-2 text-sm" onClick={() => setOpen(false)}>
              Cancel
            </button>
            <button type="button" className="rounded-md bg-forest px-4 py-2 text-sm text-snow" onClick={createRole}>
              Create role
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
