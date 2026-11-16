type IconProps = {
  className?: string;
};

export function PlusIcon({ className = "size-2.5" }: IconProps) {
  return (
    <svg viewBox="0 0 10 10" fill="none" aria-hidden className={className}>
      <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function ArrowRightIcon({ className = "size-3" }: IconProps) {
  return (
    <svg viewBox="0 0 12 10" fill="none" aria-hidden className={className}>
      <path d="M1 5h9M6.5 1.5 10 5 6.5 8.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ChevronRightIcon({ className = "size-4" }: IconProps) {
  return (
    <svg viewBox="0 0 16 16" fill="none" aria-hidden className={className}>
      <path d="M6 3.5 10.5 8 6 12.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function TrendUpIcon({ className = "size-2" }: IconProps) {
  return (
    <svg viewBox="0 0 8 8" fill="none" aria-hidden className={className}>
      <path d="M1 5.5 4 2.5 7 5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
