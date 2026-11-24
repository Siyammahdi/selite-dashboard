"use client";

import { useState } from "react";
import { Drawer } from "@/components/ui/drawer";
import { FieldShell, SelectField, TextArea, TextInput } from "@/components/ui/form-fields";
import { ImageTile } from "@/components/ui/image-tile";
import { slugify } from "@/lib/form-utils";
import { addCategory, deleteCategory, updateCategory, useDashboard } from "@/lib/stores/dashboard";
import { pushToast } from "@/lib/stores/ui";
import type { ProductCategory } from "@/lib/types";

type CategoryDrawerProps = {
  open: boolean;
  category?: ProductCategory | null;
  onClose: () => void;
  /** Called with the new category's slug right after it's created. */
  onCreated?: (slug: string) => void;
};

export function CategoryDrawer({ open, category, onClose, onCreated }: CategoryDrawerProps) {
  if (!open) return null;
  return <CategoryDrawerForm key={category?.slug ?? "create"} category={category} onClose={onClose} onCreated={onCreated} />;
}

function CategoryDrawerForm({
  category,
  onClose,
  onCreated,
}: {
  category?: ProductCategory | null;
  onClose: () => void;
  onCreated?: (slug: string) => void;
}) {
  const { products, categories } = useDashboard();
  const editing = Boolean(category);
  const [name, setName] = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [active, setActive] = useState(category?.active ?? true);
  const [image, setImage] = useState(category?.image ?? "");
  const [internalNotes, setInternalNotes] = useState(category?.internalNotes ?? "");
  const [error, setError] = useState("");

  function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Category name is required");
      pushToast("Category name is required", "error");
      return;
    }

    if (editing && category) {
      updateCategory(category.slug, {
        name: trimmed,
        description: description.trim(),
        active,
        image: image || undefined,
        internalNotes: internalNotes.trim(),
      });
      pushToast("Category updated");
      onClose();
      return;
    }

    const baseSlug = slugify(trimmed) || `category-${Date.now()}`;
    let slug = baseSlug;
    let n = 2;
    while (categories.some((c) => c.slug === slug)) {
      slug = `${baseSlug}-${n++}`;
    }

    addCategory({
      slug,
      name: trimmed,
      description: description.trim(),
      active,
      image: image || undefined,
      internalNotes: internalNotes.trim(),
    });
    pushToast("Category added");
    onCreated?.(slug);
    onClose();
  }

  function handleDelete() {
    if (!category) return;
    const inUse = products.some((p) => p.category === category.slug);
    if (inUse) {
      pushToast("Move or reassign products out of this category before deleting it", "error");
      return;
    }
    if (!window.confirm(`Delete category “${category.name}”?`)) return;
    deleteCategory(category.slug);
    pushToast("Category deleted", "info");
    onClose();
  }

  return (
    <Drawer
      open
      title={editing ? "Edit Category" : "Add Category"}
      onClose={onClose}
      footer={
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="rounded-lg bg-forest px-4 py-2.5 text-sm font-semibold text-lime transition hover:bg-ink"
            >
              {editing ? "Save Change" : "Add Category"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-[29px] py-2.5 text-sm font-semibold text-ink transition hover:bg-snow"
            >
              Cancel
            </button>
          </div>
          {editing ? (
            <button
              type="button"
              onClick={handleDelete}
              className="rounded-lg border-[0.5px] border-[#d00036] bg-[#f9e4ea] px-8 py-2.5 text-sm font-semibold text-[#d00036] transition hover:bg-[#f3d0da]"
            >
              Delete Category
            </button>
          ) : null}
        </div>
      }
    >
      <div className="flex flex-col gap-3 pb-4">
        <TextInput label="Category Name" required value={name} onChange={setName} error={error} />
        <TextArea label="Description" rows={4} value={description} onChange={setDescription} />
        <SelectField
          label="Activity Status"
          value={active ? "active" : "inactive"}
          onChange={(v) => setActive(v === "active")}
          options={[
            { value: "active", label: "Active" },
            { value: "inactive", label: "Inactive" },
          ]}
        />
        <FieldShell label="Category Image">
          <div className="w-[106px]">
            <ImageTile src={image || undefined} onPick={setImage} onRemove={image ? () => setImage("") : undefined} />
          </div>
        </FieldShell>
        <TextArea label="Internal notes" rows={3} value={internalNotes} onChange={setInternalNotes} />
      </div>
    </Drawer>
  );
}
