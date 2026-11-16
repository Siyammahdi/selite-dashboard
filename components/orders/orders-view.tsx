"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { OrderDrawer } from "@/components/orders/order-drawer";
import { ChevronRightIcon } from "@/components/ui/icons";
import { FilterTabs } from "@/components/ui/filter-tabs";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { StatusBadge } from "@/components/ui/status-badge";
import { ToolbarActions } from "@/components/ui/toolbar-actions";
import { formatAmount } from "@/lib/format";
import { orderStatusCounts, paginate } from "@/lib/metrics";
import { useDashboard } from "@/lib/stores/dashboard";
import type { AdminOrder } from "@/lib/types";

const PAGE_SIZE = 8;
const ALL = "All";

export function OrdersView() {
  const state = useDashboard();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = searchParams.get("status") ?? ALL;
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const [selected, setSelected] = useState<AdminOrder | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  function updateQuery(next: { status?: string; page?: number }) {
    const params = new URLSearchParams(searchParams.toString());
    const status = next.status ?? tab;
    const nextPage = next.page ?? page;

    if (!status || status === ALL) params.delete("status");
    else params.set("status", status);

    if (nextPage <= 1) params.delete("page");
    else params.set("page", String(nextPage));

    const query = params.toString();
    router.push(query ? `${pathname}?${query}` : pathname, { scroll: false });
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

  const filtered = useMemo(
    () => (tab === ALL ? state.orders : state.orders.filter((o) => o.status === tab)),
    [state.orders, tab],
  );
  const paged = paginate(filtered, page, PAGE_SIZE);

  return (
    <div className="mx-auto flex w-full max-w-[1131px] flex-col gap-4">
      <PageHeader title="All Orders" actions={[{ label: "Create New Order", onClick: () => setCreateOpen(true) }]} />

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <FilterTabs
            tabs={tabs}
            active={tab}
            onChange={(label) => updateQuery({ status: label, page: 1 })}
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
          onChange={(nextPage) => updateQuery({ page: nextPage })}
          helper={`${paged.total} orders · page ${paged.page} of ${paged.totalPages}`}
        />
      </section>

      <OrderDrawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={(order) => updateQuery({ status: order.status, page: 1 })}
      />

      <OrderDrawer
        open={!!selected}
        order={selected}
        onClose={() => setSelected(null)}
        onSaved={(order) => {
          setSelected(null);
          updateQuery({ status: order.status, page: 1 });
        }}
      />
    </div>
  );
}
