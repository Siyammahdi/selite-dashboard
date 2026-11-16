"use client";

import Image from "next/image";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ChevronRightIcon } from "@/components/ui/icons";
import { FilterTabs } from "@/components/ui/filter-tabs";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { StatusBadge } from "@/components/ui/status-badge";
import { ToolbarActions } from "@/components/ui/toolbar-actions";
import { formatAmount, formatTaka } from "@/lib/format";
import { orderStatusCounts, paginate } from "@/lib/metrics";
import { addOrder, updateOrderStatus, useDashboard } from "@/lib/stores/dashboard";
import { pushToast } from "@/lib/stores/ui";
import type { AdminOrder, OrderStatus } from "@/lib/types";

const PAGE_SIZE = 8;
const ALL = "All";

export function OrdersView() {
  const state = useDashboard();
  const searchParams = useSearchParams();
  const initialStatus = searchParams.get("status") ?? ALL;
  const [tab, setTab] = useState(initialStatus);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<AdminOrder | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  useEffect(() => {
    setTab(initialStatus);
    setPage(1);
  }, [initialStatus]);

  const counts = orderStatusCounts(state.orders);
  const tabs = [
    { label: ALL, count: counts.All },
    { label: "New Order", count: counts["New Order"] },
    { label: "In Process", count: counts["In Process"] },
    { label: "Shipped", count: counts.Shipped },
    { label: "Delivered", count: counts.Delivered },
    { label: "Cancelled", count: counts.Cancelled },
    { label: "Return", count: counts.Return },
  ];

  const filtered = useMemo(
    () => (tab === ALL ? state.orders : state.orders.filter((o) => o.status === tab)),
    [state.orders, tab],
  );
  const paged = paginate(filtered, page, PAGE_SIZE);

  function createOrder() {
    const product = state.products.find((p) => p.active) ?? state.products[0];
    if (!product) return;
    const order: AdminOrder = {
      id: `SL${Date.now().toString().slice(-8)}`,
      createdAt: new Date().toISOString(),
      customer: "New Customer",
      phone: "+880 1700 000099",
      address: "Dhaka",
      zone: "inside",
      category: product.categoryLabel,
      amount: product.sellingPrice + 80,
      courier: "Pathao",
      status: "New Order",
      items: [
        {
          id: product.id,
          name: product.name,
          price: product.sellingPrice,
          quantity: 1,
          image: product.image,
        },
      ],
      subtotal: product.sellingPrice,
      deliveryCharge: 80,
    };
    addOrder(order);
    setCreateOpen(false);
    setTab("New Order");
    setPage(1);
    pushToast(`Order #${order.id} created`);
  }

  function setStatus(order: AdminOrder, status: OrderStatus) {
    updateOrderStatus(order.id, status);
    setSelected({ ...order, status });
    pushToast(`Updated to ${status}`);
  }

  return (
    <div className="mx-auto flex w-full max-w-[1131px] flex-col gap-4">
      <PageHeader title="All Orders" actions={[{ label: "Create New Order", onClick: () => setCreateOpen(true) }]} />

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <FilterTabs
            tabs={tabs}
            active={tab}
            onChange={(label) => {
              setTab(label);
              setPage(1);
            }}
          />
          <ToolbarActions
            items={["date", "export"]}
            onExport={() => {
              const blob = new Blob([JSON.stringify(filtered, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "selite-orders.json";
              a.click();
              URL.revokeObjectURL(url);
            }}
          />
        </div>

        <div className="overflow-x-auto rounded-lg border border-stone bg-white">
          <table className="w-full min-w-[980px] border-collapse text-sm">
            <thead>
              <tr className="bg-[#ecece4] text-left text-forest">
                <th className="px-4 py-3 font-normal">Order</th>
                <th className="px-4 py-3 font-normal">Customer</th>
                <th className="px-4 py-3 font-normal">Contact Info</th>
                <th className="px-4 py-3 font-normal">Product Category</th>
                <th className="px-4 py-3 font-normal">Amount</th>
                <th className="px-4 py-3 font-normal">Courier</th>
                <th className="px-4 py-3 font-normal">Order Status</th>
                <th className="px-4 py-3 font-normal">Action</th>
              </tr>
            </thead>
            <tbody>
              {paged.items.map((order) => (
                <tr key={order.id} className="border-t border-stone transition hover:bg-snow/80">
                  <td className="px-4 py-3 text-forest">#{order.id}</td>
                  <td className="px-4 py-3 font-semibold text-ink">{order.customer}</td>
                  <td className="px-4 py-3 text-ink">{order.phone}</td>
                  <td className="px-4 py-3 text-ink">{order.category}</td>
                  <td className="px-4 py-3 text-ink">{formatAmount(order.amount)}</td>
                  <td className="px-4 py-3 text-ink">{order.courier}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="text-ink transition hover:translate-x-0.5"
                      aria-label={`Open ${order.id}`}
                      onClick={() => setSelected(order)}
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
          helper={`${paged.total} orders · page ${paged.page} of ${paged.totalPages}`}
        />
      </section>

      <Modal open={createOpen} title="Create New Order" onClose={() => setCreateOpen(false)}>
        <p className="mb-4 text-sm text-ink/70">Create a COD order from the first active catalog product.</p>
        <div className="flex justify-end gap-2">
          <button type="button" className="rounded-md border border-stone px-4 py-2 text-sm" onClick={() => setCreateOpen(false)}>
            Cancel
          </button>
          <button type="button" className="rounded-md bg-forest px-4 py-2 text-sm text-snow" onClick={createOrder}>
            Create order
          </button>
        </div>
      </Modal>

      <Modal open={!!selected} title={selected ? `Order #${selected.id}` : "Order"} onClose={() => setSelected(null)} wide>
        {selected ? (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <p className="text-xs text-ink/50">Customer</p>
                <p className="font-semibold">{selected.customer}</p>
                <p className="text-sm">{selected.phone}</p>
                <p className="text-sm text-ink/70">{selected.address}</p>
              </div>
              <div>
                <p className="text-xs text-ink/50">Fulfillment</p>
                <p className="text-sm">Courier: {selected.courier}</p>
                <p className="text-sm">Zone: {selected.zone}</p>
                <div className="mt-1">
                  <StatusBadge status={selected.status} />
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-stone">
              {selected.items.map((item) => (
                <div key={`${selected.id}-${item.id}`} className="flex items-center gap-3 border-b border-stone p-3 last:border-b-0">
                  {item.image ? (
                    <Image src={item.image} alt="" width={48} height={48} className="size-12 rounded object-cover" />
                  ) : null}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{item.name}</p>
                    <p className="text-sm text-ink/60">
                      {item.quantity} × {formatTaka(item.price)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between text-sm">
              <span>Total</span>
              <span className="text-lg font-semibold">{formatTaka(selected.amount)}</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {(["New Order", "In Process", "Shipped", "Delivered", "Cancelled", "Return"] as OrderStatus[]).map(
                (status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setStatus(selected, status)}
                    className={`rounded-md border px-3 py-1.5 text-xs transition ${
                      selected.status === status
                        ? "border-forest bg-forest text-white"
                        : "border-stone hover:bg-snow"
                    }`}
                  >
                    {status}
                  </button>
                ),
              )}
            </div>
          </div>
        ) : null}
      </Modal>
    </div>
  );
}
