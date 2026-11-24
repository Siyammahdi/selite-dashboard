"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronRightIcon, EyeIcon } from "@/components/ui/icons";

type OrderRowActionsProps = {
  onView: () => void;
  onDownloadInvoice: () => void;
};

type MenuPos = { top: number; left: number; width: number };

export function OrderRowActions({ onView, onDownloadInvoice }: OrderRowActionsProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<MenuPos | null>(null);

  function updatePosition() {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({ top: rect.bottom + 6, left: Math.max(12, rect.right - 208), width: 208 });
  }

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    const onScroll = () => updatePosition();
    window.addEventListener("resize", onScroll);
    window.addEventListener("scroll", onScroll, true);
    return () => {
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("scroll", onScroll, true);
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      const t = e.target as Node;
      if (triggerRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const menu =
    open && pos
      ? createPortal(
          <div
            ref={menuRef}
            role="menu"
            className="animate-scale-in fixed z-[80] flex flex-col gap-1 rounded-lg border border-stone bg-white p-1.5 shadow-[0_12px_40px_rgba(2,37,31,0.14)]"
            style={{ top: pos.top, left: pos.left, width: pos.width }}
          >
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onView();
              }}
              className="flex items-center justify-between gap-2 rounded-md px-3 py-2.5 text-left text-sm font-semibold text-ink transition hover:bg-snow"
            >
              View Details
              <EyeIcon className="size-5 text-ink" />
            </button>
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setOpen(false);
                onDownloadInvoice();
              }}
              className="flex items-center justify-between gap-2 rounded-md px-3 py-2.5 text-left text-sm font-semibold text-ink transition hover:bg-snow"
            >
              Download Invoice
              <Image src="/icons/download.svg" alt="" width={20} height={20} className="size-5" />
            </button>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Order actions"
        onClick={() => {
          if (open) setOpen(false);
          else {
            updatePosition();
            setOpen(true);
          }
        }}
        className="text-ink transition hover:translate-x-0.5"
      >
        <ChevronRightIcon />
      </button>
      {menu}
    </>
  );
}
