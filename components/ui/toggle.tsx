type ToggleProps = {
  checked?: boolean;
};

export function Toggle({ checked = false }: ToggleProps) {
  return (
    <span
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
        checked ? "bg-lime" : "bg-[#6b7280]"
      }`}
      aria-hidden
    >
      <span
        className={`size-4 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-4" : "translate-x-0.5"
        }`}
      />
    </span>
  );
}
