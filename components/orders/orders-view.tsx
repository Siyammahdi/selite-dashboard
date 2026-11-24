"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { OrderDrawer } from "@/components/orders/order-drawer";
import { EmptyState } from "@/components/ui/empty-state";
import { ChevronRightIcon } from "@/components/ui/icons";
import { FilterTabs } from "@/components/ui/filter-tabs";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { SearchField } from "@/components/ui/search-field";
import { StatusSelect } from "@/components/ui/status-select";
import { ToolbarActions } from "@/components/ui/toolbar-actions";
import { downloadCsv } from "@/lib/export";
import { formatAmount } from "@/lib/format";
import { orderStatusCounts, paginate } from "@/lib/metrics";
import { updateOrderStatus, useDashboard } from "@/lib/stores/dashboard";
import { pushToast } from "@/lib/stores/ui";
import type { OrderStatus } from "@/lib/types";

const PAGE_SIZE = 8;
const ALL = "All";

export function OrdersView() {
  const state = useDashboard();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("status") ?? ALL;
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const selected = selectedId ? (state.orders.find((o) => o.id === selectedId) ?? null) : null;

  function updateQuery(next: { status?: string; page?: number }) {
    const params = new URLSearchParams(searchParams.toString());
    const status = next.status ?? tab;
    const nextPage = next.page ?? page;

    if (!status || status === ALL) params.delete("status");
    else params.set("status", status);

    if (nextPage <= 1) params.delete("page");
    else params.set("page", String(nextPage));

    const queryString = params.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
  }

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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = tab === ALL ? state.orders : state.orders.filter((o) => o.status === tab);
    if (q) {
      list = list.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          o.customer.toLowerCase().includes(q) ||
          o.phone.toLowerCase().includes(q) ||
          (o.email ?? "").toLowerCase().includes(q) ||
          o.category.toLowerCase().includes(q) ||
          o.courier.toLowerCase().includes(q),
      );
    }
    return list;
  }, [state.orders, tab, query]);

  const paged = paginate(filtered, page, PAGE_SIZE);

  function changeStatus(id: string, status: OrderStatus) {
    updateOrderStatus(id, status);
    pushToast(`Order #${id} → ${status}`);
  }

  return (
    <div className="flex w-full flex-col gap-4">
      <PageHeader title="All Orders" actions={[{ label: "Create New Order", onClick: () => setCreateOpen(true) }]} />

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <FilterTabs
            tabs={tabs}
            active={tab}
            onChange={(label) => updateQuery({ status: label, page: 1 })}
          />
          <div className="flex flex-wrap items-center gap-3">
            <SearchField
              value={query}
              onChange={(value) => {
                setQuery(value);
                updateQuery({ page: 1 });
              }}
              placeholder="Search orders…"
            />
            <ToolbarActions
              items={["date", "export"]}
              onExport={() => {
                downloadCsv(
                  "selite-orders.csv",
                  filtered.map((o) => ({
                    id: o.id,
                    customer: o.customer,
                    phone: o.phone,
                    email: o.email ?? "",
                    category: o.category,
                    amount: o.amount,
                    courier: o.courier,
                    status: o.status,
                    paymentStatus: o.paymentStatus ?? "",
                    createdAt: o.createdAt,
                  })),
                );
                pushToast(`Exported ${filtered.length} orders`);
              }}
            />
          </div>
        </div>

        {paged.items.length === 0 ? (
          <EmptyState
            title={query ? "No orders match your search" : "No orders in this status"}
            description="Create a new order or switch status tabs to see more."
            action={{ label: "Create New Order", onClick: () => setCreateOpen(true) }}
          />
        ) : (
          <>
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
                    <tr
                      key={order.id}
                      className="border-t border-stone transition hover:bg-snow/80"
                      onDoubleClick={() => setSelectedId(order.id)}
                    >
                      <td className="px-4 py-3 text-forest">#{order.id}</td>
                      <td className="px-4 py-3 font-semibold text-ink">{order.customer}</td>
                      <td className="px-4 py-3 text-ink">{order.phone}</td>
                      <td className="px-4 py-3 text-ink">{order.category}</td>
                      <td className="px-4 py-3 text-ink">{formatAmount(order.amount)}</td>
                      <td className="px-4 py-3 text-ink">{order.courier}</td>
                      <td className="px-4 py-3">
                        <StatusSelect
                          value={order.status}
                          onChange={(status) => changeStatus(order.id, status)}
                        />
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          className="text-ink transition hover:translate-x-0.5"
                          aria-label={`Open ${order.id}`}
                          onClick={() => setSelectedId(order.id)}
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
              helper={`${paged.total} orders · page ${paged.page} of ${paged.totalPages}`}
            />
          </>
        )}
      </section>

      <OrderDrawer open={createOpen} onClose={() => setCreateOpen(false)} />

      <OrderDrawer open={!!selected} order={selected} onClose={() => setSelectedId(null)} />
    </div>
  );
}
