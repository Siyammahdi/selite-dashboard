type Tab = {
  label: string;
  count: number;
};

type FilterTabsProps = {
  tabs: readonly Tab[] | Tab[];
  active?: string;
};

export function FilterTabs({ tabs, active }: FilterTabsProps) {
  const current = active ?? tabs[0]?.label;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {tabs.map((tab) => {
        const isActive = tab.label === current;
        return (
          <button
            key={tab.label}
            type="button"
            className={`inline-flex h-[27px] items-center gap-2 rounded-md px-2 text-sm ${
              isActive ? "bg-forest text-white" : "border border-stone bg-white text-ink"
            }`}
          >
            {tab.label}
            <span
              className={`inline-flex min-w-[27px] items-center justify-center rounded px-1 text-xs ${
                isActive ? "bg-lime text-ink" : "bg-forest text-white"
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
