"use client";

import { useMemo, useState } from "react";
import { ChevronRightIcon } from "@/components/ui/icons";
import { FilterTabs } from "@/components/ui/filter-tabs";
import { Modal } from "@/components/ui/modal";
import { PageHeader } from "@/components/ui/page-header";
import { Pagination } from "@/components/ui/pagination";
import { StatCard } from "@/components/ui/stat-card";
import { ToolbarActions } from "@/components/ui/toolbar-actions";
import { formatAmount, formatTaka } from "@/lib/format";
import { financeTotals, paginate } from "@/lib/metrics";
import { addExpense, addInvestment, useDashboard } from "@/lib/stores/dashboard";
import { pushToast } from "@/lib/stores/ui";
import type { Expense, Investment } from "@/lib/types";

const PAGE_SIZE = 8;

export function FinanceView() {
  const state = useDashboard();
  const [tab, setTab] = useState<"Expense" | "Investments">("Expense");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Expense | Investment | null>(null);
  const totals = financeTotals(state);

  const list = tab === "Expense" ? state.expenses : state.investments;
  const paged = paginate(list, page, PAGE_SIZE);

  const stats = useMemo(
    () => [
      {
        label: "Total Revenue",
        value: formatTaka(totals.revenue),
        delta: "12%",
        hint: "vs last month",
        tone: "snow" as const,
      },
      {
        label: "Total Expenses",
        value: formatTaka(totals.expenses),
        delta: "12%",
        hint: "vs last month",
        tone: "butter" as const,
      },
      {
        label: "Total Investments",
        value: formatTaka(totals.investments),
        delta: "12%",
        hint: "Across all investments",
        tone: "lime" as const,
      },
      {
        label: "Net Profit",
        value: formatTaka(totals.profit),
        delta: "12%",
        hint: "vs last month",
        tone: "aqua" as const,
      },
    ],
    [totals],
  );

  return (
    <div className="mx-auto flex w-full max-w-[1132px] flex-col gap-4">
      <PageHeader
        title="Finance"
        actions={[
          {
            label: "Add New Invest",
            variant: "accent",
            onClick: () => {
              const item: Investment = {
                id: `INV-${Date.now().toString().slice(-4)}`,
                name: "New Investment",
                category: "Operations",
                amount: 10000,
                date: new Date().toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }),
              };
              addInvestment(item);
              setTab("Investments");
              setPage(1);
              pushToast("Investment added");
            },
          },
          {
            label: "Add New Expense",
            onClick: () => {
              const item: Expense = {
                id: `EXP-${Date.now().toString().slice(-4)}`,
                name: "New Expense",
                category: "Others",
                amount: 2000,
                date: new Date().toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }),
              };
              addExpense(item);
              setTab("Expense");
              setPage(1);
              pushToast("Expense added");
            },
          },
        ]}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={stat.label} {...stat} index={index} />
        ))}
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <FilterTabs
            tabs={[
              { label: "Expense", count: state.expenses.length },
              { label: "Investments", count: state.investments.length },
            ]}
            active={tab}
            onChange={(label) => {
              setTab(label as "Expense" | "Investments");
              setPage(1);
            }}
          />
          <ToolbarActions
            onExport={() => {
              const blob = new Blob([JSON.stringify(list, null, 2)], { type: "application/json" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `selite-${tab.toLowerCase()}.json`;
              a.click();
              URL.revokeObjectURL(url);
            }}
          />
        </div>

        <div className="overflow-x-auto rounded-lg border border-stone bg-white">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="bg-[#ecece4] text-left text-forest">
                <th className="px-4 py-3 font-normal">{tab === "Expense" ? "Expense No" : "Invest No"}</th>
                <th className="px-4 py-3 font-normal">{tab === "Expense" ? "Expense Name" : "Investment Name"}</th>
                <th className="px-4 py-3 font-normal">Category</th>
                <th className="px-4 py-3 font-normal">Amount</th>
                <th className="px-4 py-3 font-normal">Date</th>
                <th className="px-4 py-3 font-normal">Action</th>
              </tr>
            </thead>
            <tbody>
              {paged.items.map((row) => (
                <tr key={row.id} className="border-t border-stone transition hover:bg-snow/80">
                  <td className="px-4 py-3 text-forest">{row.id}</td>
                  <td className="px-4 py-3 text-ink">{row.name}</td>
                  <td className="px-4 py-3 font-semibold text-ink">{row.category}</td>
                  <td className="px-4 py-3 text-ink">{formatAmount(row.amount)}</td>
                  <td className="px-4 py-3 text-ink">{row.date}</td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="text-ink transition hover:translate-x-0.5"
                      onClick={() => setSelected(row)}
                      aria-label={`Open ${row.id}`}
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
          helper={`${paged.total} ${tab.toLowerCase()} records`}
        />
      </section>

      <Modal open={!!selected} title={selected?.name ?? "Record"} onClose={() => setSelected(null)}>
        {selected ? (
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-ink/50">ID:</span> {selected.id}
            </p>
            <p>
              <span className="text-ink/50">Category:</span> {selected.category}
            </p>
            <p>
              <span className="text-ink/50">Amount:</span> {formatTaka(selected.amount)}
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
