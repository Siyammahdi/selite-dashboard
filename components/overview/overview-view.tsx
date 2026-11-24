"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { OrderDrawer } from "@/components/orders/order-drawer";
import { ArrowRightIcon } from "@/components/ui/icons";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { StatusSelect } from "@/components/ui/status-select";
import { formatAmount, formatTaka } from "@/lib/format";
import { alertSummary, overviewStats, topSelling } from "@/lib/metrics";
import { updateOrderStatus, useDashboard } from "@/lib/stores/dashboard";
import { pushToast } from "@/lib/stores/ui";
import type { OrderStatus } from "@/lib/types";

export function OverviewView() {
  const state = useDashboard();
  const router = useRouter();
  const [createOpen, setCreateOpen] = useState(false);
  const stats = useMemo(() => overviewStats(state), [state]);
  const alerts = useMemo(() => alertSummary(state.orders, state.products), [state.orders, state.products]);
  const recent = state.orders.slice(0, 9);
  const tops = topSelling(state.products, 5);

  return (
    <div className="flex w-full flex-col gap-4">
      <PageHeader title="Overview" actions={[{ label: "Create New Order", onClick: () => setCreateOpen(true) }]} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={stat.label} {...stat} index={index} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_327px]">
        <section className="animate-fade-up rounded-lg border border-stone bg-white p-4" style={{ animationDelay: "120ms" }}>
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Recent Orders</h2>
            <Link href="/orders" className="inline-flex items-center gap-2 text-sm text-ink transition hover:gap-3">
              View All
              <ArrowRightIcon />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] border-collapse text-sm">
              <thead>
                <tr className="bg-stone text-left text-forest">
                  <th className="px-4 py-2 font-normal">Order ID</th>
                  <th className="px-4 py-2 font-normal">Customer Info</th>
                  <th className="px-4 py-2 font-normal">Contact Info</th>
                  <th className="px-4 py-2 text-center font-normal">Amount</th>
                  <th className="px-4 py-2 text-center font-normal">Order Status</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((order) => (
                  <tr
                    key={order.id}
                    className="cursor-pointer border-b border-stone transition hover:bg-snow/70"
                    onClick={() => router.push(`/orders?status=${encodeURIComponent(order.status)}`)}
                  >
                    <td className="px-4 py-3 text-forest">#{order.id}</td>
                    <td className="px-4 py-3 font-semibold text-ink">{order.customer}</td>
                    <td className="px-4 py-3 text-ink">{order.phone}</td>
                    <td className="px-4 py-3 text-center text-forest">{formatAmount(order.amount)}</td>
                    <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                      <StatusSelect
                        value={order.status}
                        onChange={(status: OrderStatus) => {
                          updateOrderStatus(order.id, status);
                          pushToast(`Order #${order.id} → ${status}`);
                        }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-lg border border-stone bg-white">
            {alerts.map((card) => (
              <Link
                key={card.title}
                href={card.href}
                className="flex w-full items-center justify-between border-b border-stone px-3 py-4 text-left transition last:border-b-0 hover:bg-snow"
              >
                <div className="flex items-center gap-2">
                  <Image src={card.icon} alt="" width={32} height={32} className="size-8" />
                  <div>
                    <p className="text-sm font-medium text-ink">{card.title}</p>
                    <p className="text-sm text-ink/70">{card.description}</p>
                  </div>
                </div>
                <ArrowRightIcon className="size-3 text-ink" />
              </Link>
            ))}
          </div>

          <section className="rounded-lg border border-stone bg-white p-4">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink">Top Sell</h2>
              <Link href="/products" className="inline-flex items-center gap-2 text-sm text-ink transition hover:gap-3">
                All Products
                <ArrowRightIcon />
              </Link>
            </div>

            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-stone text-left text-forest">
                  <th className="px-3 py-2 font-normal">Product</th>
                  <th className="px-2 py-2 font-normal">Revenue</th>
                  <th className="px-2 py-2 font-normal">Units Sold</th>
                </tr>
              </thead>
              <tbody>
                {tops.map((item) => (
                  <tr key={item.id} className="border-b border-stone transition hover:bg-snow/70">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Image
                          src={item.image}
                          alt=""
                          width={28}
                          height={28}
                          className="size-7 rounded object-cover"
                        />
                        <span className="line-clamp-1 text-ink">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2 whitespace-nowrap text-ink">
                      {formatTaka(item.sellingPrice * item.unitsSold)}
                    </td>
                    <td className="px-2 py-2 text-ink">{item.unitsSold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </div>

      <OrderDrawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSaved={() => router.push("/orders")}
      />
    </div>
  );
}
