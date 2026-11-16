import { ChevronRightIcon } from "@/components/ui/icons";
import { FilterTabs } from "@/components/ui/filter-tabs";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { ToolbarActions } from "@/components/ui/toolbar-actions";
import { purchases } from "@/lib/data";

export default function PurchasesPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1132px] flex-col gap-4">
      <PageHeader
        title="Purchases"
        actions={[
          { label: "Others Purchase", variant: "accent" },
          { label: "New Purchase" },
        ]}
      />

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <FilterTabs
            tabs={[
              { label: "Product", count: 120 },
              { label: "Others", count: 10 },
            ]}
          />
          <ToolbarActions />
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
              {purchases.map((purchase, index) => (
                <tr key={`${purchase.vendor}-${index}`} className="border-t border-stone">
                  <td className="px-4 py-3 text-ink">{purchase.product}</td>
                  <td className="px-4 py-3 font-semibold text-ink">{purchase.category}</td>
                  <td className="px-4 py-3 text-ink">{purchase.quantity}</td>
                  <td className="px-4 py-3 text-ink">{purchase.purchasePrice}</td>
                  <td className="px-4 py-3 text-ink">{purchase.vendor}</td>
                  <td className="px-4 py-3 text-ink">{purchase.date}</td>
                  <td className="px-4 py-3">
                    <button type="button" className="text-ink" aria-label={`Open purchase ${index + 1}`}>
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
