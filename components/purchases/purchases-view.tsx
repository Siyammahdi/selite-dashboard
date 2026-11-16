"use client";

import { useMemo, useState } from "react";
import { PurchaseDrawer } from "@/components/purchases/purchase-drawer";
import { ChevronRightIcon } from "@/components/ui/icons";
import { FilterTabs } from "@/components/ui/filter-tabs";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { ToolbarActions } from "@/components/ui/toolbar-actions";
import { downloadCsv } from "@/lib/export";
import { formatAmount } from "@/lib/format";
import { paginate } from "@/lib/metrics";
import { useDashboard } from "@/lib/stores/dashboard";
import { pushToast } from "@/lib/stores/ui";

const PAGE_SIZE = 8;

export function PurchasesView() {
  const state = useDashboard();
  const [tab, setTab] = useState<"Product" | "Others">("Product");
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createKind, setCreateKind] = useState<"product" | "others" | null>(null);
  const selected = selectedId ? (state.purchases.find((p) => p.id === selectedId) ?? null) : null;

  const filtered = useMemo(
    () => state.purchases.filter((p) => (tab === "Product" ? p.kind === "product" : p.kind === "others")),
    [state.purchases, tab],
  );
  const paged = paginate(filtered, page, PAGE_SIZE);

  return (
    <div className="mx-auto flex w-full max-w-[1132px] flex-col gap-4">
      <PageHeader
        title="Purchases"
        actions={[
          {
            label: "Others Purchase",
            variant: "accent",
            onClick: () => {
              setSelectedId(null);
              setCreateKind("others");
            },
          },
          {
            label: "New Purchase",
            onClick: () => {
              setSelectedId(null);
              setCreateKind("product");
            },
          },
        ]}
      />

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <FilterTabs
            tabs={[
              { label: "Product", count: state.purchases.filter((p) => p.kind === "product").length },
              { label: "Others", count: state.purchases.filter((p) => p.kind === "others").length },
            ]}
            active={tab}
            onChange={(label) => {
              setTab(label as "Product" | "Others");
              setPage(1);
            }}
          />
          <ToolbarActions
            onExport={() => {
              downloadCsv(
                "selite-purchases.csv",
                filtered.map((p) => ({
                  id: p.id,
                  product: p.product,
                  category: p.category,
                  quantity: p.quantity,
                  purchasePrice: p.purchasePrice,
                  vendor: p.vendor,
                  date: p.date,
                  kind: p.kind,
                })),
              );
              pushToast(`Exported ${filtered.length} purchases`);
            }}
          />
        </div>

        <div className="overflow-x-auto rounded-lg border border-stone bg-white">
          <table className="w-full min-w-[980px] border-collapse text-sm">
            <thead>
              <tr className="bg-[#ecece4] text-left text-forest">
                <th className="px-4 py-3 font-normal">Product</th>
                <th className="px-4 py-3 font-normal">Category</th>
                <th className="px-4 py-3 font-normal">Quantity</th>
                <th className="px-4 py-3 font-normal">Purchase price</th>
                <th className="px-4 py-3 font-normal">Vendor Name</th>
                <th className="px-4 py-3 font-normal">Date</th>
                <th className="px-4 py-3 font-normal">Action</th>
              </tr>
            </thead>
            <tbody>
              {paged.items.map((purchase) => (
                <tr key={purchase.id} className="border-t border-stone transition hover:bg-snow/80">
                  <td className="px-4 py-3 text-ink">{purchase.product}</td>
                  <td className="px-4 py-3 font-semibold text-ink">{purchase.category}</td>
                  <td className="px-4 py-3 text-ink">{purchase.quantity}</td>
                  <td className="px-4 py-3 text-ink">{formatAmount(purchase.purchasePrice)}</td>
                  <td className="px-4 py-3 text-ink">{purchase.vendor}</td>
                  <td className="px-4 py-3 text-ink">{purchase.date}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="text-ink transition hover:translate-x-0.5"
                      onClick={() => {
                        setCreateKind(null);
                        setSelectedId(purchase.id);
                      }}
                      aria-label={`Open ${purchase.id}`}
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
          helper={`${paged.total} purchase records`}
        />
      </section>

      <PurchaseDrawer
        open={createKind === "product"}
        kind="product"
        onClose={() => {
          setCreateKind(null);
          setTab("Product");
          setPage(1);
        }}
      />
      <PurchaseDrawer
        open={createKind === "others"}
        kind="others"
        onClose={() => {
          setCreateKind(null);
          setTab("Others");
          setPage(1);
        }}
      />
      <PurchaseDrawer
        open={!!selected}
        kind={selected?.kind ?? "product"}
        purchase={selected}
        onClose={() => setSelectedId(null)}
      />
    </div>
  );
}
