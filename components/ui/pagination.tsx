"use client";

import Image from "next/image";

type PaginationProps = {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  helper?: string;
};

function pageList(page: number, totalPages: number) {
  if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
  if (page <= 3) return [1, 2, 3, "…", totalPages] as const;
  if (page >= totalPages - 2) return [1, "…", totalPages - 2, totalPages - 1, totalPages] as const;
  return [1, "…", page, "…", totalPages] as const;
}

export function Pagination({
  page,
  totalPages,
  onChange,
  helper = "Manage every order, from the first click to the front door.",
}: PaginationProps) {
  const pages = pageList(page, totalPages);

  return (
    <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-ink/70">{helper}</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          className="flex size-8 items-center justify-center rounded border border-stone bg-white transition hover:bg-snow disabled:opacity-40"
          aria-label="Previous page"
        >
          <Image src="/icons/carat-ink.svg" alt="" width={8} height={13} className="rotate-90" />
        </button>
        {pages.map((item, index) =>
          item === "…" ? (
            <span key={`ellipsis-${index}`} className="flex size-8 items-center justify-center text-sm">
              …
            </span>
          ) : (
            <button
              key={item}
              type="button"
              onClick={() => onChange(item)}
              className={`flex size-8 items-center justify-center rounded border text-sm transition ${
                item === page
                  ? "border-lime bg-lime text-ink"
                  : "border-stone bg-white text-ink hover:bg-snow"
              }`}
            >
              {item}
            </button>
          ),
        )}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
          className="flex size-8 items-center justify-center rounded border border-stone bg-white transition hover:bg-snow disabled:opacity-40"
          aria-label="Next page"
        >
          <Image src="/icons/carat-ink.svg" alt="" width={8} height={13} className="-rotate-90" />
        </button>
      </div>
    </div>
  );
}
