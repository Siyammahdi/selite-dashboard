import Image from "next/image";

export function Pagination() {
  const pages = [1, 2, "…", 9, 10] as const;

  return (
    <div className="flex items-center justify-between pt-2">
      <p className="text-sm text-ink/70">Manage every order, from the first click to the front door.</p>
      <div className="flex items-center gap-2">
        <button type="button" className="flex size-8 items-center justify-center rounded border border-stone bg-white" aria-label="Previous page">
          <Image src="/icons/carat.svg" alt="" width={24} height={24} className="size-6 rotate-180" />
        </button>
        {pages.map((page) => (
          <button
            key={page}
            type="button"
            className={`flex size-8 items-center justify-center rounded border text-sm ${
              page === 1 ? "border-lime bg-lime text-ink" : "border-stone bg-white text-ink"
            }`}
          >
            {page}
          </button>
        ))}
        <button type="button" className="flex size-8 items-center justify-center rounded border border-stone bg-white" aria-label="Next page">
          <Image src="/icons/carat.svg" alt="" width={24} height={24} className="size-6" />
        </button>
      </div>
    </div>
  );
}
