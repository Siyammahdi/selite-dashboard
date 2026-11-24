"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { CategoryDrawer } from "@/components/products/category-drawer";
import { ProductDrawer } from "@/components/products/product-drawer";
import { EmptyState } from "@/components/ui/empty-state";
import { ChevronRightIcon } from "@/components/ui/icons";
import { FilterDropdown } from "@/components/ui/filter-dropdown";
import { FilterTabs } from "@/components/ui/filter-tabs";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { SearchField } from "@/components/ui/search-field";
import { Toggle } from "@/components/ui/toggle";
import { ToolbarActions } from "@/components/ui/toolbar-actions";
import { downloadCsv } from "@/lib/export";
import { formatAmount } from "@/lib/format";
import { isLowStock, paginate } from "@/lib/metrics";
import { setProductActive, useDashboard } from "@/lib/stores/dashboard";
import { pushToast } from "@/lib/stores/ui";
import type { ProductCategory } from "@/lib/types";

const PAGE_SIZE = 10;

export function ProductsView() {
  const state = useDashboard();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"Product" | "Category">("Product");
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const stockFilter = searchParams.get("stock") === "low";
  const categoryFilter = searchParams.get("category") ?? "";
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [categoryDrawer, setCategoryDrawer] = useState<{ open: boolean; category: ProductCategory | null }>({
    open: false,
    category: null,
  });
  const selected = selectedId != null ? (state.products.find((p) => p.id === selectedId) ?? null) : null;

  function updateQuery(next: { stock?: boolean; category?: string; page?: number }) {
    const params = new URLSearchParams(searchParams.toString());
    const lowStock = next.stock ?? stockFilter;
    const nextCategory = next.category ?? categoryFilter;
    const nextPage = next.page ?? page;

    if (lowStock) params.set("stock", "low");
    else params.delete("stock");

    if (nextCategory) params.set("category", nextCategory);
    else params.delete("category");

    if (nextPage <= 1) params.delete("page");
    else params.set("page", String(nextPage));

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }

  const filteredProducts = useMemo(() => {
    let list = state.products;
    if (stockFilter) list = list.filter(isLowStock);
    if (categoryFilter) list = list.filter((p) => p.category === categoryFilter);
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
  }, [state.products, stockFilter, categoryFilter, query]);

  const paged = paginate(filteredProducts, page, PAGE_SIZE);

  const categoryFilterOptions = state.categories.map((cat) => ({
    value: cat.slug,
    label: cat.name,
    count: state.products.filter((p) => p.category === cat.slug).length,
  }));

  const categoryRows = state.categories.map((cat) => {
    const items = state.products.filter((p) => p.category === cat.slug);
    const unitsSold = items.reduce((sum, p) => sum + p.unitsSold, 0);
    return {
      category: cat,
      count: items.length,
      sold: unitsSold,
      image: cat.image ?? items[0]?.image ?? "/images/product-thumb-1.png",
    };
  });

  return (
    <div className="flex w-full flex-col gap-4">
      <PageHeader
        title="All Products Collection"
        actions={[
          {
            label: "Add Category",
            variant: "accent",
            onClick: () => setCategoryDrawer({ open: true, category: null }),
          },
          { label: "Add New Item", onClick: () => setAddOpen(true) },
        ]}
      />

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <FilterTabs
            tabs={[
              { label: "Product", count: state.products.length },
              { label: "Category", count: state.categories.length },
            ]}
            active={tab}
            onChange={(label) => setTab(label as "Product" | "Category")}
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
            <FilterDropdown
              value={categoryFilter}
              onChange={(next) => updateQuery({ category: next, page: 1 })}
              options={categoryFilterOptions}
              allCount={state.products.length}
            />
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
              title={query || stockFilter || categoryFilter ? "No products match your filters" : "No products yet"}
              description="Try clearing search / filters, or add a new item."
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
                      <td
                        className={`px-4 py-3 font-semibold ${
                          product.stock <= (product.lowStockThreshold ?? 5) ? "text-flame" : "text-ink"
                        }`}
                      >
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
        ) : categoryRows.length === 0 ? (
          <EmptyState
            title="No categories yet"
            description="Add your first category to start organizing products."
            action={{ label: "Add Category", onClick: () => setCategoryDrawer({ open: true, category: null }) }}
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {categoryRows.map(({ category, count, sold, image }, index) => (
              <button
                key={category.slug}
                type="button"
                onClick={() => setCategoryDrawer({ open: true, category })}
                className="animate-fade-up overflow-hidden rounded-xl border border-stone bg-white text-left transition hover:-translate-y-0.5 hover:shadow-md"
                style={{ animationDelay: `${index * 40}ms` }}
              >
                <div className="relative aspect-[295/166] w-full bg-stone">
                  <Image src={image} alt="" fill className="object-cover" />
                  <span
                    className={`absolute top-2 left-2 rounded border px-2 py-0.5 text-xs font-medium ${
                      category.active
                        ? "border-forest/30 bg-white/90 text-forest"
                        : "border-stone bg-white/90 text-ink/50"
                    }`}
                  >
                    {category.active ? "Active" : "Inactive"}
                  </span>
                </div>
                <div className="flex flex-col gap-1 p-3">
                  <p className="font-semibold text-flame">{category.name}</p>
                  <p className="flex items-center gap-4 text-sm text-ink/70">
                    <span>Items-{count}</span>
                    <span>Sell-{sold}</span>
                  </p>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      <ProductDrawer open={addOpen} onClose={() => setAddOpen(false)} />
      <ProductDrawer open={!!selected} product={selected} onClose={() => setSelectedId(null)} />
      <CategoryDrawer
        open={categoryDrawer.open}
        category={categoryDrawer.category}
        onClose={() => setCategoryDrawer({ open: false, category: null })}
      />
    </div>
  );
}
