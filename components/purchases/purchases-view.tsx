"use client";

import { useMemo, useState } from "react";
import { ChevronRightIcon } from "@/components/ui/icons";
import { FilterTabs } from "@/components/ui/filter-tabs";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { ToolbarActions } from "@/components/ui/toolbar-actions";
import { formatAmount, formatTaka } from "@/lib/format";
import { paginate } from "@/lib/metrics";
import { addPurchase, useDashboard } from "@/lib/stores/dashboard";
import { pushToast } from "@/lib/stores/ui";
import type { Purchase } from "@/lib/types";

const PAGE_SIZE = 8;

export function PurchasesView() {
  const state = useDashboard();
  const [tab, setTab] = useState<"Product" | "Others">("Product");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Purchase | null>(null);

  const filtered = useMemo(
    () => state.purchases.filter((p) => (tab === "Product" ? p.kind === "product" : p.kind === "others")),
    [state.purchases, tab],
  );
  const paged = paginate(filtered, page, PAGE_SIZE);

  function createPurchase(kind: "product" | "others") {
    const product = state.products[0];
    const purchase: Purchase = {
      id: `PUR-${Date.now().toString().slice(-5)}`,
      productId: kind === "product" ? (product?.id ?? null) : null,
      product: kind === "product" ? (product?.name.split("(")[0]?.trim() ?? "Bags") : "Misc Purchase",
      category: kind === "product" ? (product?.categoryLabel ?? "Bags") : "Others",
      quantity: kind === "product" ? 10 : 1,
      purchasePrice: kind === "product" ? (product?.purchasePrice ?? 500) : 1500,
      vendor: kind === "product" ? "Atik- Deluxe Shop" : "General Vendor",
      date: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      kind,
    };
    addPurchase(purchase);
    setTab(kind === "product" ? "Product" : "Others");
    setPage(1);
    pushToast("Purchase recorded");
  }

  return (
    <div className="mx-auto flex w-full max-w-[1132px] flex-col gap-4">
      <PageHeader
        title="Purchases"
        actions={[
          { label: "Others Purchase", variant: "accent", onClick: () => createPurchase("others") },
          { label: "New Purchase", onClick: () => createPurchase("product") },
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
              const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "selite-purchases.json";
              a.click();
              URL.revokeObjectURL(url);
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
                      onClick={() => setSelected(purchase)}
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

      <Modal open={!!selected} title={selected?.product ?? "Purchase"} onClose={() => setSelected(null)}>
        {selected ? (
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-ink/50">Vendor:</span> {selected.vendor}
            </p>
            <p>
              <span className="text-ink/50">Category:</span> {selected.category}
            </p>
            <p>
              <span className="text-ink/50">Qty:</span> {selected.quantity}
            </p>
            <p>
              <span className="text-ink/50">Unit cost:</span> {formatTaka(selected.purchasePrice)}
            </p>
            <p>
              <span className="text-ink/50">Line total:</span>{" "}
              {formatTaka(selected.purchasePrice * selected.quantity)}
            </p>
            <p>
              <span className="text-ink/50">Date:</span> {selected.date}
            </p>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
