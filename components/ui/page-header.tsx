import { PlusIcon } from "@/components/ui/icons";

type Action = {
  label: string;
  variant?: "primary" | "accent";
};

type PageHeaderProps = {
  title: string;
  actions?: Action[];
};

export function PageHeader({ title, actions = [] }: PageHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-[32px] leading-none font-semibold tracking-[-0.02em] text-ink">{title}</h1>
      {actions.length > 0 ? (
        <div className="flex items-center gap-4">
          {actions.map((action) => (
            <button
              key={action.label}
              type="button"
              className={`inline-flex h-[38px] items-center gap-2 rounded-[6.316px] px-4 text-sm font-medium text-snow ${
                action.variant === "accent" ? "bg-flame" : "bg-forest"
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
