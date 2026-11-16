import Image from "next/image";

type ToolbarActionsProps = {
  items?: Array<"date" | "filter" | "export">;
  dateLabel?: string;
};

export function ToolbarActions({
  items = ["filter", "export"],
  dateLabel = "Last 30 days",
}: ToolbarActionsProps) {
  return (
    <div className="flex items-center gap-6 text-sm text-ink">
      {items.includes("date") ? (
        <button type="button" className="inline-flex items-center gap-2">
          {dateLabel}
          <Image src="/icons/calendar.svg" alt="" width={24} height={24} className="size-6" />
        </button>
      ) : null}
      {items.includes("filter") ? (
        <button type="button" className="inline-flex items-center gap-2">
          Filter
          <Image src="/icons/filter.svg" alt="" width={24} height={24} className="size-6" />
        </button>
      ) : null}
      {items.includes("export") ? (
        <button type="button" className="inline-flex items-center gap-2">
          Export
          <Image src="/icons/download.svg" alt="" width={24} height={24} className="size-6" />
        </button>
      ) : null}
    </div>
  );
}
