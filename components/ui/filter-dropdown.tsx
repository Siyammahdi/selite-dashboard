"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FilterIcon } from "@/components/ui/icons";

export type FilterOption = {
  value: string;
  label: string;
  count: number;
};

type FilterDropdownProps = {
  value: string;
  onChange: (value: string) => void;
  options: FilterOption[];
  allLabel?: string;
  allCount: number;
};

type MenuPos = { top: number; left: number; width: number };

export function FilterDropdown({ value, onChange, options, allLabel = "All", allCount }: FilterDropdownProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<MenuPos | null>(null);

  function updatePosition() {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({ top: rect.bottom + 6, left: Math.max(12, rect.right - 220), width: 220 });
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

  function pick(next: string) {
    onChange(next);
    setOpen(false);
  }

  const rows = [{ value: "all", label: allLabel, count: allCount }, ...options];

  const menu =
    open && pos
      ? createPortal(
          <div
            ref={menuRef}
            role="listbox"
            aria-label="Filter"
            className="animate-scale-in fixed z-[80] flex max-h-[320px] flex-col gap-1.5 overflow-y-auto rounded-lg border border-stone bg-white p-1.5 shadow-[0_12px_40px_rgba(2,37,31,0.14)]"
            style={{ top: pos.top, left: pos.left, width: pos.width }}
          >
            {rows.map((opt) => {
              const isSelected = opt.value === value || (opt.value === "all" && !value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => pick(opt.value === "all" ? "" : opt.value)}
                  className={`flex items-center justify-between gap-2 rounded-md px-3 py-2 text-left text-sm font-semibold transition ${
                    isSelected ? "bg-forest text-white" : "bg-white text-ink hover:bg-snow"
                  }`}
                >
                  <span className="min-w-0 truncate">{opt.label}</span>
                  <span className="shrink-0 rounded bg-lime px-2 py-0.5 text-xs font-semibold text-ink">
                    {opt.count}
                  </span>
                </button>
              );
            })}
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (open) setOpen(false);
          else {
            updatePosition();
            setOpen(true);
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={`flex h-9 items-center gap-2 rounded-md border px-3 text-sm text-ink transition ${
          open || value ? "border-forest" : "border-stone hover:bg-snow"
        }`}
      >
        Filter
        <FilterIcon className="size-4" />
      </button>
      {menu}
    </>
  );
}
