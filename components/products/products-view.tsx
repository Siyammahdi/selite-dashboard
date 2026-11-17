"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { categories } from "@/lib/catalog";
import { ProductDrawer } from "@/components/products/product-drawer";
import { EmptyState } from "@/components/ui/empty-state";
import { ChevronRightIcon } from "@/components/ui/icons";
import { FilterTabs } from "@/components/ui/filter-tabs";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { SearchField } from "@/components/ui/search-field";
import { Toggle } from "@/components/ui/toggle";
import { ToolbarActions } from "@/components/ui/toolbar-actions";
import { downloadCsv } from "@/lib/export";
import { formatAmount } from "@/lib/format";
import { paginate } from "@/lib/metrics";
import { setProductActive, useDashboard } from "@/lib/stores/dashboard";
import { pushToast } from "@/lib/stores/ui";

const PAGE_SIZE = 10;

export function ProductsView() {
  const state = useDashboard();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"Product" | "Category">("Product");
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const stockFilter = searchParams.get("stock") === "low";
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const selected = selectedId != null ? (state.products.find((p) => p.id === selectedId) ?? null) : null;

  function updateQuery(next: { stock?: boolean; page?: number }) {
    const params = new URLSearchParams(searchParams.toString());
    const lowStock = next.stock ?? stockFilter;
    const nextPage = next.page ?? page;

    if (lowStock) params.set("stock", "low");
    else params.delete("stock");

    if (nextPage <= 1) params.delete("page");
    else params.set("page", String(nextPage));

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }

  const filteredProducts = useMemo(() => {
    let list = state.products;
    if (stockFilter) list = list.filter((p) => p.stock > 0 && p.stock <= 5);
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.categoryLabel.toLowerCase().includes(q) ||
          p.code.toLowerCase().includes(q),
      );
    }
    return list;
  }, [state.products, stockFilter, query]);

  const paged = paginate(filteredProducts, page, PAGE_SIZE);

  const categoryRows = categories.map((cat) => {
    const items = state.products.filter((p) => p.category === cat.slug);
    return {
      slug: cat.slug,
      name: cat.name,
      count: items.length,
      active: items.filter((p) => p.active).length,
      lowStock: items.filter((p) => p.stock <= 5).length,
      image: items[0]?.image ?? "/images/product-thumb-1.png",
    };
  });

  return (
    <div className="mx-auto flex w-full max-w-[1132px] flex-col gap-4">
      <PageHeader
        title="All Products Collection"
        actions={[
          {
            label: "Add Category",
            variant: "accent",
            onClick: () => {
              setTab("Category");
              pushToast("Switch to Category tab to review groups", "info");
            },
          },
          { label: "Add New Item", onClick: () => setAddOpen(true) },
        ]}
      />

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <FilterTabs
            tabs={[
              { label: "Product", count: state.products.length },
              { label: "Category", count: categories.length },
            ]}
            active={tab}
            onChange={(label) => {
              setTab(label as "Product" | "Category");
              updateQuery({ page: 1 });
            }}
          />
          <div className="flex flex-wrap items-center gap-3">
            <SearchField
              value={query}
              onChange={(value) => {
                setQuery(value);
                updateQuery({ page: 1 });
              }}
              placeholder="Search products…"
            />
            <button
              type="button"
              onClick={() => updateQuery({ stock: !stockFilter, page: 1 })}
              className={`rounded-md border px-3 py-1.5 text-sm transition ${
                stockFilter ? "border-forest bg-forest text-white" : "border-stone bg-white hover:bg-snow"
              }`}
            >
              Low stock
            </button>
            <ToolbarActions
              onExport={() => {
                downloadCsv(
                  "selite-products.csv",
                  filteredProducts.map((p) => ({
                    id: p.id,
                    name: p.name,
                    category: p.categoryLabel,
                    code: p.code,
                    stock: p.stock,
                    unitsSold: p.unitsSold,
                    sellingPrice: p.sellingPrice,
                    purchasePrice: p.purchasePrice,
                    active: p.active,
                  })),
                );
                pushToast(`Exported ${filteredProducts.length} products`);
              }}
            />
          </div>
        </div>

        {tab === "Product" ? (
          paged.items.length === 0 ? (
            <EmptyState
              title={query || stockFilter ? "No products match your filters" : "No products yet"}
              description="Try clearing search / low-stock filter, or add a new item."
              action={{ label: "Add New Item", onClick: () => setAddOpen(true) }}
            />
          ) : (
          <>
            <div className="overflow-x-auto rounded-lg border border-stone bg-white">
              <table className="w-full min-w-[980px] border-collapse text-sm">
                <thead>
                  <tr className="bg-[#ecece4] text-left text-forest">
                    <th className="px-4 py-3 font-normal">Product Name</th>
                    <th className="px-4 py-3 font-normal">Category</th>
                    <th className="px-4 py-3 font-normal">Stock</th>
                    <th className="px-4 py-3 font-normal">All Time Sell</th>
                    <th className="px-4 py-3 font-normal">Selling Price</th>
                    <th className="px-4 py-3 font-normal">Purchase Price</th>
                    <th className="px-4 py-3 font-normal">Activity Status</th>
                    <th className="px-4 py-3 font-normal">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paged.items.map((product) => (
                    <tr key={product.id} className="border-t border-stone transition hover:bg-snow/80">
                      <td className="px-4 py-3">
                        <div className="flex max-w-[280px] items-center gap-2">
                          <Image
                            src={product.image}
                            alt=""
                            width={36}
                            height={36}
                            className="size-9 rounded object-cover"
                          />
                          <span className="line-clamp-2 text-ink">{product.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 font-semibold text-ink">{product.categoryLabel}</td>
                      <td className={`px-4 py-3 font-semibold ${product.stock <= 5 ? "text-flame" : "text-ink"}`}>
                        {product.stock}
                      </td>
                      <td className="px-4 py-3 text-ink">{product.unitsSold}</td>
                      <td className="px-4 py-3 text-ink">{formatAmount(product.sellingPrice)}</td>
                      <td className="px-4 py-3 text-ink">{formatAmount(product.purchasePrice)}</td>
                      <td className="px-4 py-3">
                        <Toggle
                          checked={product.active}
                          label={`Toggle ${product.name}`}
                          onChange={(next) => {
                            setProductActive(product.id, next);
                            pushToast(next ? "Product activated" : "Product deactivated", "info");
                          }}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          className="text-ink transition hover:translate-x-0.5"
                          aria-label={`Open ${product.name}`}
                          onClick={() => setSelectedId(product.id)}
                        >
                          <ChevronRightIcon />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              page={paged.page}
              totalPages={paged.totalPages}
              onChange={(nextPage) => updateQuery({ page: nextPage })}
              helper={`${paged.total} products · synced from Selite storefront catalog`}
            />
          </>
          )
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {categoryRows.map((cat, index) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => {
                  setQuery(cat.name.split(" ")[0] ?? "");
                  setTab("Product");
                  updateQuery({ page: 1 });
                }}
                className="animate-fade-up flex items-center gap-3 rounded-xl border border-stone bg-white p-4 text-left transition hover:-translate-y-0.5 hover:shadow-md"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <Image src={cat.image} alt="" width={64} height={64} className="size-16 rounded-lg object-cover" />
                <div>
                  <p className="font-semibold text-ink">{cat.name}</p>
                  <p className="text-sm text-ink/70">
                    {cat.count} products · {cat.active} active
                  </p>
                  <p className="text-xs text-flame">{cat.lowStock} low stock</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <ProductDrawer open={addOpen} onClose={() => setAddOpen(false)} />
      <ProductDrawer open={!!selected} product={selected} onClose={() => setSelectedId(null)} />
    </div>
  );
}
