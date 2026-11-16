"use client";

import { useEffect } from "react";
import { CloseIcon } from "@/components/ui/icons";

type DrawerProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
};

export function Drawer({ open, title, onClose, children, footer }: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex justify-end bg-ink/40">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close drawer" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal
        aria-label={title}
        className="animate-slide-in-right relative z-10 flex h-full w-full max-w-[484px] flex-col bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between gap-3 px-7 pt-7 pb-2">
          <h2 className="font-brand text-[20px] leading-[1.2] font-bold text-forest">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded border border-ink text-ink transition hover:bg-snow"
            aria-label="Close"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="no-scrollbar flex-1 overflow-y-auto px-7 py-2">{children}</div>
        {footer ? <div className="border-t border-stone/60 px-7 py-4">{footer}</div> : null}
      </aside>
    </div>
  );
}

type DrawerActionsProps = {
  onSave: () => void;
  onCancel: () => void;
  onDelete?: () => void;
  saveLabel?: string;
  deleteLabel?: string;
  saving?: boolean;
};

export function DrawerActions({
  onSave,
  onCancel,
  onDelete,
  saveLabel = "Save Change",
  deleteLabel = "Delete",
  saving,
}: DrawerActionsProps) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-lg bg-forest px-4 py-2.5 text-sm font-semibold text-lime transition hover:bg-ink disabled:opacity-60"
        >
          {saveLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg px-[29px] py-2.5 text-sm font-semibold text-ink transition hover:bg-snow"
        >
          Cancel
        </button>
      </div>
      {onDelete ? (
        <button
          type="button"
          onClick={onDelete}
          className="rounded-lg border-[0.5px] border-[#d00036] bg-[#f9e4ea] px-8 py-2.5 text-sm font-semibold text-[#d00036] transition hover:bg-[#f3d0da]"
        >
          {deleteLabel}
        </button>
      ) : null}
    </div>
  );
}
