"use client";

import { useState } from "react";
import { Modal } from "@/components/ui/modal";
import { TextInput } from "@/components/ui/form-fields";

type AddCategoryModalProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (name: string) => void;
};

export function AddCategoryModal({ open, onClose, onAdd }: AddCategoryModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  function handleAdd() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Category name is required");
      return;
    }
    onAdd(trimmed);
    setName("");
    setError("");
    onClose();
  }

  return (
    <Modal open={open} title="Add New Category" onClose={onClose}>
      <div className="flex flex-col gap-4">
        <TextInput label="Category Name" required value={name} onChange={setName} error={error} />
        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-[29px] py-2.5 text-sm font-semibold text-ink transition hover:bg-snow"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAdd}
            className="rounded-lg bg-forest px-4 py-2.5 text-sm font-semibold text-lime transition hover:bg-ink"
          >
            Add Category
          </button>
        </div>
      </div>
    </Modal>
  );
}
