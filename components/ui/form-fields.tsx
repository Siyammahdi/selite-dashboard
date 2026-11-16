"use client";

import { ChevronDownIcon } from "@/components/ui/icons";

const fieldClass =
  "h-[42px] w-full rounded border border-stone bg-white px-3 text-sm text-ink outline-none transition placeholder:text-ink/35 focus:border-forest";
const labelClass = "text-sm text-ink";

type FieldShellProps = {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
  className?: string;
};

export function FieldShell({ label, required, error, children, className = "" }: FieldShellProps) {
  return (
    <label className={`flex w-full flex-col gap-1 ${className}`}>
      <span className={labelClass}>
        {label}
        {required ? " *" : ""}
      </span>
      {children}
      {error ? <span className="text-xs text-[#d00036]">{error}</span> : null}
    </label>
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
  return (
    <FieldShell label={label} required={required} error={error} className={className}>
      <input
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
};

export function TextArea({ label, value, onChange, required, error, rows = 4, className }: TextAreaProps) {
  return (
    <FieldShell label={label} required={required} error={error} className={className}>
      <textarea
        value={value}
        rows={rows}
        onChange={(e) => onChange(e.target.value)}
        className="w-full resize-y rounded border border-stone bg-white px-3 py-2 text-sm text-ink outline-none transition focus:border-forest"
      />
    </FieldShell>
  );
}

type SelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  required?: boolean;
  error?: string;
  className?: string;
};

export function SelectField({ label, value, onChange, options, required, error, className }: SelectFieldProps) {
  return (
    <FieldShell label={label} required={required} error={error} className={className}>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={`${fieldClass} appearance-none pr-9`}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 size-3 -translate-y-1/2 text-ink/50" />
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
  return (
    <FieldShell label={label} required={required} error={error} className={className}>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={fieldClass}
      />
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
  return (
    <FieldShell label={label} required={required} error={error} className={className}>
      <input type="date" value={value} onChange={(e) => onChange(e.target.value)} className={fieldClass} />
    </FieldShell>
  );
}
