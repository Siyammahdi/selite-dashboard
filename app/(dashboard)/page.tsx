import Image from "next/image";
import Link from "next/link";
import { ArrowRightIcon } from "@/components/ui/icons";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { alertCards, overviewStats, recentOrders, topSells } from "@/lib/data";

export default function OverviewPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1131px] flex-col gap-4">
      <PageHeader title="Overview" actions={[{ label: "Create New Order" }]} />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {overviewStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_327px]">
        <section className="rounded-lg border border-stone bg-white p-4">
          <div className="mb-1 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-ink">Recent Orders</h2>
            <Link href="/orders" className="inline-flex items-center gap-2 text-sm text-ink">
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
                {recentOrders.map((order, index) => (
                  <tr key={`${order.id}-${index}`} className="border-b border-stone">
                    <td className="px-4 py-3 text-forest">{order.id}</td>
                    <td className="px-4 py-3 font-semibold text-ink">{order.customer}</td>
                    <td className="px-4 py-3 text-ink">{order.contact}</td>
                    <td className="px-4 py-3 text-center text-forest">{order.amount}</td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={order.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-lg border border-stone bg-white">
            {alertCards.map((card) => (
              <button
                key={card.title}
                type="button"
                className="flex w-full items-center justify-between border-b border-stone px-3 py-4 text-left last:border-b-0"
              >
                <div className="flex items-center gap-2">
                  <Image src={card.icon} alt="" width={32} height={32} className="size-8" />
                  <div>
                    <p className="text-sm font-medium text-ink">{card.title}</p>
                    <p className="text-sm text-ink/70">{card.description}</p>
                  </div>
                </div>
                <ArrowRightIcon className="size-3 text-ink" />
              </button>
            ))}
          </div>

          <section className="rounded-lg border border-stone bg-white p-4">
            <div className="mb-1 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink">Top Sell</h2>
              <Link href="/products" className="inline-flex items-center gap-2 text-sm text-ink">
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
                {topSells.map((item) => (
                  <tr key={item.name} className="border-b border-stone">
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <Image
                          src={item.image}
                          alt=""
                          width={28}
                          height={28}
                          className="size-7 rounded object-cover"
                        />
                        <span className="text-ink">{item.name}</span>
                      </div>
                    </td>
                    <td className="px-2 py-2 text-ink">{item.revenue}</td>
                    <td className="px-2 py-2 text-ink">{item.unitsSold}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </div>
    </div>
  );
}
