import { ChevronRightIcon } from "@/components/ui/icons";
import { FilterTabs } from "@/components/ui/filter-tabs";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { Toggle } from "@/components/ui/toggle";
import { ToolbarActions } from "@/components/ui/toolbar-actions";
import { products } from "@/lib/data";

export default function ProductsPage() {
  return (
    <div className="mx-auto flex w-full max-w-[1132px] flex-col gap-4">
      <PageHeader
        title="All Products Collection"
        actions={[
          { label: "Add Category", variant: "accent" },
          { label: "Add New Item" },
        ]}
      />

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <FilterTabs
            tabs={[
              { label: "Product", count: 120 },
              { label: "Category", count: 10 },
            ]}
          />
          <ToolbarActions />
        </div>

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
              {products.map((product, index) => (
                <tr key={`${product.name}-${index}`} className="border-t border-stone">
                  <td className="px-4 py-3 text-ink">{product.name}</td>
                  <td className="px-4 py-3 font-semibold text-ink">{product.category}</td>
                  <td className="px-4 py-3 font-semibold text-ink">{product.stock}</td>
                  <td className="px-4 py-3 text-ink">{product.allTimeSell}</td>
                  <td className="px-4 py-3 text-ink">{product.sellingPrice}</td>
                  <td className="px-4 py-3 text-ink">{product.purchasePrice}</td>
                  <td className="px-4 py-3">
                    <Toggle checked={product.active} />
                  </td>
                  <td className="px-4 py-3">
                    <button type="button" className="text-ink" aria-label={`Open ${product.name}`}>
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
