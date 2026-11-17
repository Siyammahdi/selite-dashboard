"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDownIcon } from "@/components/ui/icons";
import type { OrderStatus } from "@/lib/types";

const STATUSES: OrderStatus[] = [
  "New Order",
  "In Process",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Return",
];

const styles: Record<OrderStatus, string> = {
  "New Order": "border-forest bg-snow text-forest",
  "In Process": "border-transparent bg-[#fff3e0] text-[#c56a00]",
  Shipped: "border-transparent bg-[#e8f4ff] text-[#1a6fb5]",
  Delivered: "border-transparent bg-[#e8f8e8] text-[#1f7a3f]",
  Cancelled: "border-transparent bg-[#fdecec] text-[#b42318]",
  Return: "border-transparent bg-[#fff0e6] text-flame",
};

const dots: Record<OrderStatus, string> = {
  "New Order": "bg-forest",
  "In Process": "bg-[#c56a00]",
  Shipped: "bg-[#1a6fb5]",
  Delivered: "bg-[#1f7a3f]",
  Cancelled: "bg-[#b42318]",
  Return: "bg-flame",
};

type StatusSelectProps = {
  value: OrderStatus;
  onChange: (status: OrderStatus) => void;
  className?: string;
};

export function StatusSelect({ value, onChange, className = "" }: StatusSelectProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number; width: number } | null>(null);

  function updatePosition() {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const width = Math.max(rect.width, 160);
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    const preferBelow = spaceBelow >= 220;
    setPos({
      width,
      left: Math.min(rect.left, window.innerWidth - width - 8),
      top: preferBelow ? rect.bottom + 6 : Math.max(8, rect.top - 6 - 220),
    });
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
            role="listbox"
            aria-label="Order status"
            className="animate-scale-in fixed z-[80] overflow-hidden rounded-lg border border-stone bg-white py-1 shadow-[0_12px_40px_rgba(2,37,31,0.14)]"
            style={{ top: pos.top, left: pos.left, width: pos.width }}
          >
            {STATUSES.map((status) => {
              const selected = status === value;
              return (
                <button
                  key={status}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    onChange(status);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition ${
                    selected ? "bg-snow" : "hover:bg-snow/80"
                  }`}
                >
                  <span className={`size-2 rounded-full ${dots[status]}`} />
                  <span className="text-ink">{status}</span>
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
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className={`inline-flex h-7 items-center gap-2 rounded-lg border px-[7px] text-xs whitespace-nowrap transition hover:brightness-[0.98] ${styles[value]} ${className}`}
      >
        <span className={`size-2 rounded-full ${dots[value]}`} />
        {value}
        <ChevronDownIcon className={`size-2.5 opacity-70 transition ${open ? "rotate-180" : ""}`} />
      </button>
      {menu}
    </>
  );
}

export { STATUSES as ORDER_STATUSES };
