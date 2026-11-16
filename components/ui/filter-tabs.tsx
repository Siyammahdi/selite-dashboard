"use client";

type Tab = {
  label: string;
  count: number;
};

type FilterTabsProps = {
  tabs: readonly Tab[] | Tab[];
  active: string;
  onChange: (label: string) => void;
};

export function FilterTabs({ tabs, active, onChange }: FilterTabsProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {tabs.map((tab) => {
        const isActive = tab.label === active;
        return (
          <button
            key={tab.label}
            type="button"
            onClick={() => onChange(tab.label)}
            className={`inline-flex h-[27px] items-center gap-2 rounded-md px-2 text-sm transition-all duration-200 ${
              isActive
                ? "bg-forest text-white shadow-sm"
                : "border border-stone bg-white text-ink hover:border-forest/40 hover:bg-snow"
            }`}
          >
            {tab.label}
            <span
              className={`inline-flex min-w-[27px] items-center justify-center rounded px-1 text-xs transition-colors ${
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
