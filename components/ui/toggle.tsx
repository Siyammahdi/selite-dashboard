"use client";

type ToggleProps = {
  checked?: boolean;
  onChange?: (next: boolean) => void;
  label?: string;
};

export function Toggle({ checked = false, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label ?? "Toggle"}
      onClick={() => onChange?.(!checked)}
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${
        checked ? "bg-lime" : "bg-[#6b7280]"
      }`}
    >
      <span
        className={`size-4 rounded-full bg-white shadow transition-transform duration-200 ease-out ${
          checked ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
