"use client";

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { ChevronDownIcon, EyeIcon, EyeOffIcon } from "@/components/ui/icons";

export const fieldClass =
  "h-[42px] w-full rounded border border-stone bg-white px-3 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-forest";
const labelClass = "text-sm text-ink";

type FieldShellProps = {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
  htmlFor?: string;
};

export function FieldShell({ label, required, error, children, className = "", htmlFor }: FieldShellProps) {
  return (
    <div className={`flex w-full flex-col gap-1 ${className}`}>
      <label htmlFor={htmlFor} className={labelClass}>
        {label}
        {required ? " *" : ""}
      </label>
      {children}
      {error ? <span className="text-xs text-[#d00036]">{error}</span> : null}
    </div>
  );
}

type TextInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  type?: string;
  placeholder?: string;
  className?: string;
};

export function TextInput({
  label,
  value,
  onChange,
  required,
  error,
  type = "text",
  placeholder,
  className,
}: TextInputProps) {
  const id = useId();
  return (
    <FieldShell label={label} required={required} error={error} className={className} htmlFor={id}>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={fieldClass}
      />
    </FieldShell>
  );
}

type TextAreaProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  rows?: number;
  className?: string;
  /** Stretch to fill the height of a flex parent instead of sizing by `rows`. */
  fill?: boolean;
};

export function TextArea({ label, value, onChange, required, error, rows = 4, className, fill }: TextAreaProps) {
  const id = useId();
  return (
    <FieldShell
      label={label}
      required={required}
      error={error}
      className={`${fill ? "min-h-0 flex-1" : ""} ${className ?? ""}`}
      htmlFor={id}
    >
      <textarea
        id={id}
        value={value}
        rows={fill ? undefined : rows}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full rounded border border-stone bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-forest ${
          fill ? "h-full flex-1 resize-none" : "resize-y"
        }`}
      />
    </FieldShell>
  );
}

type PasswordInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
  className?: string;
};

export function PasswordInput({ label, value, onChange, required, error, placeholder, className }: PasswordInputProps) {
  const id = useId();
  const [visible, setVisible] = useState(false);
  return (
    <FieldShell label={label} required={required} error={error} className={className} htmlFor={id}>
      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={`${fieldClass} pr-10`}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          className="absolute top-1/2 right-2.5 flex size-6 -translate-y-1/2 items-center justify-center text-ink/45 transition hover:text-ink"
        >
          {visible ? <EyeOffIcon className="size-4" /> : <EyeIcon className="size-4" />}
        </button>
      </div>
    </FieldShell>
  );
}

export type SelectOption = {
  value: string;
  label: string;
};

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  required?: boolean;
  error?: string;
  className?: string;
  searchable?: boolean;
  placeholder?: string;
  footerAction?: { label: string; onClick: () => void };
};

type MenuPos = { top: number; left: number; width: number; maxHeight: number };

export function SelectField({
  label,
  value,
  onChange,
  options,
  required,
  error,
  className,
  searchable,
  placeholder = "Select…",
  footerAction,
}: SelectFieldProps) {
  const id = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [pos, setPos] = useState<MenuPos | null>(null);
  const enableSearch = searchable ?? options.length > 8;

  const selected = options.find((o) => o.value === value);
  const filtered = useMemo(() => {
    if (!enableSearch || !query.trim()) return options;
    const q = query.toLowerCase();
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query, enableSearch]);

  function updatePosition() {
    const el = triggerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom - 12;
    const spaceAbove = rect.top - 12;
    const preferBelow = spaceBelow >= 180 || spaceBelow >= spaceAbove;
    const maxHeight = Math.min(280, Math.max(140, preferBelow ? spaceBelow : spaceAbove));
    setPos({
      width: rect.width,
      left: rect.left,
      top: preferBelow ? rect.bottom + 6 : rect.top - 6 - maxHeight,
      maxHeight,
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

  useEffect(() => {
    if (!open || !menuRef.current) return;
    const el = menuRef.current.querySelector<HTMLElement>(`[data-index="${activeIndex}"]`);
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  function openMenu() {
    const idx = filtered.findIndex((o) => o.value === value);
    setActiveIndex(idx < 0 ? 0 : idx);
    setQuery("");
    setOpen(true);
  }

  function pick(next: string) {
    onChange(next);
    setOpen(false);
  }

  function onTriggerKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      openMenu();
    }
  }

  function onListKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const opt = filtered[activeIndex];
      if (opt) pick(opt.value);
    }
  }

  const menu =
    open && pos
      ? createPortal(
          <div
            ref={menuRef}
            className="animate-scale-in fixed z-[80] overflow-hidden rounded-lg border border-stone bg-white shadow-[0_12px_40px_rgba(2,37,31,0.14)]"
            style={{ top: pos.top, left: pos.left, width: pos.width, maxHeight: pos.maxHeight }}
            role="listbox"
            aria-label={label}
            tabIndex={-1}
            onKeyDown={onListKeyDown}
          >
            {enableSearch ? (
              <div className="border-b border-stone p-2">
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setActiveIndex(0);
                  }}
                  placeholder="Search…"
                  className="h-9 w-full rounded border border-stone px-2.5 text-sm outline-none focus:border-forest"
                />
              </div>
            ) : null}

            <div
              className="no-scrollbar overflow-y-auto py-1"
              style={{ maxHeight: footerAction ? pos.maxHeight - 56 : pos.maxHeight - (enableSearch ? 52 : 0) }}
            >
              {filtered.length === 0 ? (
                <p className="px-3 py-2 text-sm text-ink/50">No matches</p>
              ) : (
                filtered.map((opt, index) => {
                  const isSelected = opt.value === value;
                  const isActive = index === activeIndex;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="option"
                      aria-selected={isSelected}
                      data-index={index}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => pick(opt.value)}
                      className={`flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition ${
                        isActive ? "bg-snow" : "bg-white"
                      }`}
                    >
                      <span
                        className={`flex size-4 shrink-0 items-center justify-center rounded-full border ${
                          isSelected ? "border-forest" : "border-stone"
                        }`}
                      >
                        {isSelected ? <span className="size-2 rounded-full bg-forest" /> : null}
                      </span>
                      <span className="min-w-0 flex-1 truncate text-ink">{opt.label}</span>
                    </button>
                  );
                })
              )}
            </div>

            {footerAction ? (
              <div className="border-t border-stone p-2">
                <button
                  type="button"
                  onClick={() => {
                    footerAction.onClick();
                    setOpen(false);
                  }}
                  className="flex h-9 w-full items-center justify-center rounded-md bg-forest px-3 text-sm font-semibold text-lime transition hover:bg-ink"
                >
                  {footerAction.label}
                </button>
              </div>
            ) : null}
          </div>,
          document.body,
        )
      : null;

  return (
    <FieldShell label={label} required={required} error={error} className={className} htmlFor={id}>
      <div className="relative">
        <button
          ref={triggerRef}
          id={id}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => {
            if (open) setOpen(false);
            else openMenu();
          }}
          onKeyDown={onTriggerKeyDown}
          className={`${fieldClass} flex items-center justify-between gap-2 pr-3 text-left ${
            open ? "border-forest" : ""
          }`}
        >
          <span className={`min-w-0 flex-1 truncate ${selected ? "text-ink" : "text-ink/35"}`}>
            {selected?.label ?? placeholder}
          </span>
          <ChevronDownIcon
            className={`size-3 shrink-0 text-ink/50 transition ${open ? "rotate-180" : ""}`}
          />
        </button>
        {menu}
      </div>
    </FieldShell>
  );
}

type NumberInputProps = {
  label: string;
  value: number | string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  min?: number;
  className?: string;
};

export function NumberInput({ label, value, onChange, required, error, min, className }: NumberInputProps) {
  const id = useId();
  return (
    <FieldShell label={label} required={required} error={error} className={className} htmlFor={id}>
      <input
        id={id}
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`${fieldClass} [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
      />
    </FieldShell>
  );
}

type QuantityStepperProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: number;
  className?: string;
  error?: string;
};

export function QuantityStepper({ label, value, onChange, min = 1, className, error }: QuantityStepperProps) {
  const id = useId();
  const n = Number(value);
  const current = Number.isFinite(n) ? n : min;

  function set(next: number) {
    onChange(String(Math.max(min, Math.floor(next))));
  }

  return (
    <FieldShell label={label} error={error} className={className} htmlFor={id}>
      <div className="relative flex h-[42px] items-center rounded border border-stone bg-white pr-7">
        <input
          id={id}
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(e.target.value.replace(/[^\d]/g, ""))}
          className="h-full w-full bg-transparent px-3 text-sm text-ink outline-none"
        />
        <div className="absolute top-1/2 right-2 flex -translate-y-1/2 flex-col gap-0.5">
          <button
            type="button"
            aria-label="Increase"
            className="flex size-3.5 items-center justify-center text-ink/55 transition hover:text-ink"
            onClick={() => set(current + 1)}
          >
            <ChevronDownIcon className="size-2.5 rotate-180" />
          </button>
          <button
            type="button"
            aria-label="Decrease"
            className="flex size-3.5 items-center justify-center text-ink/55 transition hover:text-ink"
            onClick={() => set(current - 1)}
          >
            <ChevronDownIcon className="size-2.5" />
          </button>
        </div>
      </div>
    </FieldShell>
  );
}

type DateInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  error?: string;
  className?: string;
};

export function DateInput({ label, value, onChange, required, error, className }: DateInputProps) {
  const id = useId();
  return (
    <FieldShell label={label} required={required} error={error} className={className} htmlFor={id}>
      <input id={id} type="date" value={value} onChange={(e) => onChange(e.target.value)} className={fieldClass} />
    </FieldShell>
  );
}
