type EmptyStateProps = {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-stone bg-white px-6 py-14 text-center">
      <p className="text-base font-semibold text-ink">{title}</p>
      {description ? <p className="mt-1 max-w-sm text-sm text-ink/60">{description}</p> : null}
      {action ? (
        <button
          type="button"
          onClick={action.onClick}
          className="mt-4 rounded-lg bg-forest px-4 py-2 text-sm font-semibold text-lime transition hover:bg-ink"
        >
          {action.label}
        </button>
      ) : null}
    </div>
  );
}
