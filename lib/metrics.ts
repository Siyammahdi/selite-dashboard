import { formatTaka } from "@/lib/format";
import type { AdminOrder, AdminProduct, DashboardState } from "@/lib/types";

export function orderStatusCounts(orders: AdminOrder[]) {
  const counts = {
    All: orders.length,
    "New Order": 0,
    "In Process": 0,
    Shipped: 0,
    Delivered: 0,
    Cancelled: 0,
    Return: 0,
  };
  for (const order of orders) counts[order.status] += 1;
  return counts;
}

export function overviewStats(state: DashboardState) {
  const revenue = state.orders
    .filter((o) => o.status !== "Cancelled" && o.status !== "Return")
    .reduce((sum, o) => sum + o.amount, 0);
  const delivered = state.orders.filter((o) => o.status === "Delivered").length;

  return [
    {
      label: "Total Revenue",
      value: formatTaka(revenue),
      delta: "12%",
      hint: "vs last month",
      tone: "butter" as const,
      showArrow: true,
    },
    {
      label: "Total Orders",
      value: String(state.orders.length),
      delta: "12%",
      hint: "vs last month",
      tone: "lime" as const,
      showArrow: true,
    },
    {
      label: "Total Products",
      value: String(state.products.length),
      delta: "12%",
      hint: "active catalog models",
      tone: "aqua" as const,
      showArrow: false,
    },
    {
      label: "Orders Delivered",
      value: String(delivered),
      delta: "12%",
      hint: "completed fulfillments",
      tone: "lilac" as const,
      showArrow: true,
    },
  ];
}

export function alertSummary(orders: AdminOrder[], products: AdminProduct[]) {
  const ready = orders.filter((o) => o.status === "Shipped").length;
  const awaiting = orders.filter((o) => o.status === "New Order" || o.status === "In Process").length;
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 5).length;
  return [
    {
      title: `${String(ready).padStart(2, "0")} Orders Ready to Ship`,
      description: "Orders packed and awaiting shipment",
      icon: "/icons/alert-ship.svg",
      href: "/orders?status=Shipped",
    },
    {
      title: `${String(awaiting).padStart(2, "0")} Orders Awaiting Processing`,
      description: "New orders require your attention",
      icon: "/icons/alert-process.svg",
      href: "/orders?status=New%20Order",
    },
    {
      title: `${String(lowStock).padStart(2, "0")} Products Low in Stock`,
      description: "Restock these products soon",
      icon: "/icons/alert-stock.svg",
      href: "/products?stock=low",
    },
  ];
}

export function topSelling(products: AdminProduct[], limit = 5) {
  return [...products].sort((a, b) => b.unitsSold - a.unitsSold).slice(0, limit);
}

export function financeTotals(state: DashboardState) {
  const revenue = state.orders
    .filter((o) => o.status !== "Cancelled" && o.status !== "Return")
    .reduce((sum, o) => sum + o.amount, 0);
  const expenses = state.expenses.reduce((sum, e) => sum + e.amount, 0);
  const investments = state.investments.reduce((sum, i) => sum + i.amount, 0);
  return {
    revenue,
    expenses,
    investments,
    profit: revenue - expenses,
  };
}

export function paginate<T>(items: T[], page: number, pageSize: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const current = Math.min(Math.max(1, page), totalPages);
  const start = (current - 1) * pageSize;
  return {
    items: items.slice(start, start + pageSize),
    page: current,
    totalPages,
    total: items.length,
  };
}
