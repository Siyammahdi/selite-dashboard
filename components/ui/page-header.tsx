"use client";

import { PlusIcon } from "@/components/ui/icons";

type Action = {
  label: string;
  variant?: "primary" | "accent";
  onClick?: () => void;
};

type PageHeaderProps = {
  title: string;
  actions?: Action[];
};

export function PageHeader({ title, actions = [] }: PageHeaderProps) {
  return (
    <div className="animate-fade-up flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-[28px] leading-none font-semibold tracking-[-0.02em] text-ink md:text-[32px]">
        {title}
      </h1>
      {actions.length > 0 ? (
        <div className="flex flex-wrap items-center gap-3">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className={`inline-flex h-[38px] items-center gap-2 rounded-[6.316px] px-4 text-sm font-medium text-snow transition hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 ${
                action.variant === "accent" ? "bg-flame hover:bg-[#e45d0d]" : "bg-forest hover:bg-ink"
              }`}
            >
              {action.label}
              <PlusIcon />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
