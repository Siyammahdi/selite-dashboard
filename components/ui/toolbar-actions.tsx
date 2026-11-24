"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export type DateRangeValue = "7" | "15" | "30" | "all";

const DATE_RANGE_OPTIONS: Array<{ value: DateRangeValue; label: string }> = [
  { value: "7", label: "Last 7 days" },
  { value: "15", label: "Last 15 days" },
  { value: "30", label: "Last 30 days" },
  { value: "all", label: "All time" },
];

type ToolbarActionsProps = {
  items?: Array<"date" | "export">;
  dateValue?: DateRangeValue;
  onDateChange?: (value: DateRangeValue) => void;
  onExport?: () => void;
};

type MenuPos = { top: number; left: number; width: number };

export function ToolbarActions({
  items = ["export"],
  dateValue = "all",
  onDateChange,
  onExport,
}: ToolbarActionsProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<MenuPos | null>(null);

  function updatePosition() {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    setPos({ top: rect.bottom + 6, left: Math.max(12, rect.right - 180), width: 180 });
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

  const currentLabel = DATE_RANGE_OPTIONS.find((o) => o.value === dateValue)?.label ?? "All time";

  const menu =
    open && pos
      ? createPortal(
          <div
            ref={menuRef}
            role="listbox"
            aria-label="Date range"
            className="animate-scale-in fixed z-[80] flex flex-col gap-1 rounded-lg border border-stone bg-white p-1.5 shadow-[0_12px_40px_rgba(2,37,31,0.14)]"
            style={{ top: pos.top, left: pos.left, width: pos.width }}
          >
            {DATE_RANGE_OPTIONS.map((opt) => {
              const isSelected = opt.value === dateValue;
              return (
                <button
                  key={opt.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onDateChange?.(opt.value);
                    setOpen(false);
                  }}
                  className={`rounded-md px-3 py-2 text-left text-sm font-semibold transition ${
                    isSelected ? "bg-forest text-white" : "text-ink hover:bg-snow"
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>,
          document.body,
        )
      : null;

  return (
    <div className="flex items-center gap-5 text-sm text-ink">
      {items.includes("date") ? (
        <>
          <button
            ref={triggerRef}
            type="button"
            aria-haspopup="listbox"
            aria-expanded={open}
            onClick={() => {
              if (open) setOpen(false);
              else {
                updatePosition();
                setOpen(true);
              }
            }}
            className="inline-flex items-center gap-2 transition hover:text-forest"
          >
            {currentLabel}
            <Image src="/icons/calendar.svg" alt="" width={24} height={24} className="size-6" />
          </button>
          {menu}
        </>
      ) : null}
      {items.includes("export") ? (
        <button
          type="button"
          onClick={() => {
            onExport?.();
          }}
          className="inline-flex items-center gap-2 transition hover:text-forest"
        >
          Export
          <Image src="/icons/download.svg" alt="" width={24} height={24} className="size-6" />
        </button>
      ) : null}
    </div>
  );
}
