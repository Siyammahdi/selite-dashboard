"use client";

import Image from "next/image";
import { pushToast } from "@/lib/stores/ui";

type ToolbarActionsProps = {
  items?: Array<"date" | "filter" | "export">;
  dateLabel?: string;
  onFilter?: () => void;
  onExport?: () => void;
  onDate?: () => void;
};

export function ToolbarActions({
  items = ["filter", "export"],
  dateLabel = "Last 30 days",
  onFilter,
  onExport,
  onDate,
}: ToolbarActionsProps) {
  return (
    <div className="flex items-center gap-5 text-sm text-ink">
      {items.includes("date") ? (
        <button
          type="button"
          onClick={() => {
            onDate?.();
            pushToast("Date range: last 30 days", "info");
          }}
          className="inline-flex items-center gap-2 transition hover:text-forest"
        >
          {dateLabel}
          <Image src="/icons/calendar.svg" alt="" width={24} height={24} className="size-6" />
        </button>
      ) : null}
      {items.includes("filter") ? (
        <button
          type="button"
          onClick={() => {
            onFilter?.();
            pushToast("Filters ready — use the tabs above", "info");
          }}
          className="inline-flex items-center gap-2 transition hover:text-forest"
        >
          Filter
          <Image src="/icons/filter.svg" alt="" width={24} height={24} className="size-6" />
        </button>
      ) : null}
      {items.includes("export") ? (
        <button
          type="button"
          onClick={() => {
            onExport?.();
            pushToast("Export started — CSV downloading soon", "success");
          }}
          className="inline-flex items-center gap-2 transition hover:text-forest"
        >
          Export
          <Image src="/icons/download.svg" alt="" width={24} height={24} className="size-6" />
        </button>
      ) : null}
    </div>
  );
}
