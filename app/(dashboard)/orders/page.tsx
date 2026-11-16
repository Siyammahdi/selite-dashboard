import { ChevronRightIcon } from "@/components/ui/icons";
import { FilterTabs } from "@/components/ui/filter-tabs";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { StatusBadge } from "@/components/ui/status-badge";
import { ToolbarActions } from "@/components/ui/toolbar-actions";
import { orderTabs, orders } from "@/lib/data";

export default function OrdersPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1131px] flex-col gap-[16px]">
      <PageHeader title="All Orders" actions={[{ label: "Create New Order" }]} />

      <section className="flex flex-col gap-[16px]">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <FilterTabs tabs={orderTabs} />
          <ToolbarActions items={["date", "export"]} />
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
              {orders.map((order) => (
                <tr key={order.id} className="border-t border-stone">
                  <td className="px-4 py-3 text-forest">{order.id}</td>
                  <td className="px-4 py-3 font-semibold text-ink">{order.customer}</td>
                  <td className="px-4 py-3 text-ink">{order.contact}</td>
                  <td className="px-4 py-3 text-ink">{order.category}</td>
                  <td className="px-4 py-3 text-ink">{order.amount}</td>
                  <td className="px-4 py-3 text-ink">{order.courier}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={order.status} />
                  </td>
                  <td className="px-4 py-3">
                    <button type="button" className="text-ink" aria-label={`Open ${order.id}`}>
                      <ChevronRightIcon />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <Pagination />
      </section>
    </div>
  );
}
