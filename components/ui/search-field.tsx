"use client";

type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
};

export function SearchField({
  value,
  onChange,
  placeholder = "Search…",
  className = "",
}: SearchFieldProps) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`h-9 w-44 rounded-md border border-stone bg-white px-3 text-sm outline-none transition focus:border-forest md:w-56 ${className}`}
    />
  );
}
