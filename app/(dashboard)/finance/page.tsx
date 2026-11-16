import { ChevronRightIcon } from "@/components/ui/icons";
import { FilterTabs } from "@/components/ui/filter-tabs";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { StatCard } from "@/components/ui/stat-card";
import { ToolbarActions } from "@/components/ui/toolbar-actions";
import { expenses, financeStats } from "@/lib/data";

export default function FinancePage() {
  return (
    <div className="mx-auto flex w-full max-w-[1132px] flex-col gap-4">
      <PageHeader
        title="Finance"
        actions={[
          { label: "Add New Invest", variant: "accent" },
          { label: "Add New Expense" },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {financeStats.map((stat) => (
          <StatCard key={stat.label} {...stat} />
        ))}
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <FilterTabs
            tabs={[
              { label: "Expense", count: 10 },
              { label: "Investments", count: 10 },
            ]}
          />
          <ToolbarActions />
        </div>

        <div className="overflow-x-auto rounded-lg border border-stone bg-white">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="bg-[#ecece4] text-left text-forest">
                <th className="px-4 py-3 font-normal">Expense No</th>
                <th className="px-4 py-3 font-normal">Expense Name</th>
                <th className="px-4 py-3 font-normal">Category</th>
                <th className="px-4 py-3 font-normal">Amount</th>
                <th className="px-4 py-3 font-normal">Date</th>
                <th className="px-4 py-3 font-normal">Action</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.no} className="border-t border-stone">
                  <td className="px-4 py-3 text-forest">{expense.no}</td>
                  <td className="px-4 py-3 text-ink">{expense.name}</td>
                  <td className="px-4 py-3 font-semibold text-ink">{expense.category}</td>
                  <td className="px-4 py-3 text-ink">{expense.amount}</td>
                  <td className="px-4 py-3 text-ink">{expense.date}</td>
                  <td className="px-4 py-3">
                    <button type="button" className="text-ink" aria-label={`Open ${expense.no}`}>
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
