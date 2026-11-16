"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { categories, getCategoryName } from "@/lib/catalog";
import { ChevronRightIcon } from "@/components/ui/icons";
import { FilterTabs } from "@/components/ui/filter-tabs";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { Toggle } from "@/components/ui/toggle";
import { ToolbarActions } from "@/components/ui/toolbar-actions";
import { formatAmount, formatTaka } from "@/lib/format";
import { paginate } from "@/lib/metrics";
import { addProduct, setProductActive, useDashboard } from "@/lib/stores/dashboard";
import { pushToast } from "@/lib/stores/ui";
import type { AdminProduct } from "@/lib/types";

const PAGE_SIZE = 10;

export function ProductsView() {
  const state = useDashboard();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"Product" | "Category">("Product");
  const [page, setPage] = useState(1);
  const [stockFilter, setStockFilter] = useState(searchParams.get("stock") === "low");
  const [selected, setSelected] = useState<AdminProduct | null>(null);
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => {
    setStockFilter(searchParams.get("stock") === "low");
  }, [searchParams]);

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

  function handleAddProduct() {
    const id = Date.now();
    const product: AdminProduct = {
      id,
      slug: `new-product-${id}`,
      name: "New Lifestyle Product",
      category: "womens-bags",
      categoryLabel: getCategoryName("womens-bags"),
      image: "/images/product-thumb-1.png",
      code: `NEW${String(id).slice(-4)}`,
      stock: 10,
      unitsSold: 0,
      sellingPrice: 999,
      purchasePrice: 500,
      active: true,
      rating: 5,
    };
    addProduct(product);
    setAddOpen(false);
    setTab("Product");
    setPage(1);
    pushToast("Product added to collection");
  }

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
              setPage(1);
            }}
          />
          <div className="flex flex-wrap items-center gap-3">
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search products…"
              className="h-9 w-44 rounded-md border border-stone bg-white px-3 text-sm outline-none transition focus:border-forest md:w-56"
            />
            <button
              type="button"
              onClick={() => {
                setStockFilter((v) => !v);
                setPage(1);
              }}
              className={`rounded-md border px-3 py-1.5 text-sm transition ${
                stockFilter ? "border-forest bg-forest text-white" : "border-stone bg-white hover:bg-snow"
              }`}
            >
              Low stock
            </button>
            <ToolbarActions
              onExport={() => {
                const blob = new Blob([JSON.stringify(filteredProducts, null, 2)], { type: "application/json" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "selite-products.json";
                a.click();
                URL.revokeObjectURL(url);
              }}
            />
          </div>
        </div>

        {tab === "Product" ? (
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
                          onClick={() => setSelected(product)}
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
              onChange={setPage}
              helper={`${paged.total} products · synced from Selite storefront catalog`}
            />
          </>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {categoryRows.map((cat, index) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => {
                  setQuery(cat.name.split(" ")[0] ?? "");
                  setTab("Product");
                  setPage(1);
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

      <Modal open={addOpen} title="Add New Item" onClose={() => setAddOpen(false)}>
        <p className="mb-4 text-sm text-ink/70">
          Adds a draft product into the admin collection. Connect a CMS/API later for permanent writes.
        </p>
        <div className="flex justify-end gap-2">
          <button type="button" className="rounded-md border border-stone px-4 py-2 text-sm" onClick={() => setAddOpen(false)}>
            Cancel
          </button>
          <button type="button" className="rounded-md bg-forest px-4 py-2 text-sm text-snow" onClick={handleAddProduct}>
            Add product
          </button>
        </div>
      </Modal>

      <Modal open={!!selected} title={selected?.name ?? "Product"} onClose={() => setSelected(null)} wide>
        {selected ? (
          <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
            <Image
              src={selected.image}
              alt=""
              width={140}
              height={140}
              className="h-[140px] w-[140px] rounded-lg object-cover"
            />
            <div className="space-y-2 text-sm">
              <p>
                <span className="text-ink/50">Category:</span> {selected.categoryLabel}
              </p>
              <p>
                <span className="text-ink/50">Code:</span> {selected.code}
              </p>
              <p>
                <span className="text-ink/50">Sell:</span> {formatTaka(selected.sellingPrice)} ·{" "}
                <span className="text-ink/50">Cost:</span> {formatTaka(selected.purchasePrice)}
              </p>
              <p>
                <span className="text-ink/50">Stock:</span> {selected.stock} ·{" "}
                <span className="text-ink/50">Sold:</span> {selected.unitsSold}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <span className="text-ink/50">Active</span>
                <Toggle
                  checked={selected.active}
                  onChange={(next) => {
                    setProductActive(selected.id, next);
                    setSelected({ ...selected, active: next });
                  }}
                />
              </div>
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
