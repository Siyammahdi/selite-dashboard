"use client";

import { createInitialState } from "@/lib/seed";
import { createStore } from "@/lib/stores/create-store";
import type {
  AdminOrder,
  AdminProduct,
  DashboardState,
  Expense,
  Investment,
  Note,
  OrderStatus,
  Purchase,
  Role,
} from "@/lib/types";

const STORAGE_KEY = "selite-dashboard-v1";
const initial = createInitialState();

export const dashboardStore = createStore<DashboardState>(initial, STORAGE_KEY);

export function useDashboard() {
  return dashboardStore.useValue();
}

export function resetDashboard() {
  dashboardStore.set(createInitialState());
}

export function setProductActive(id: number, active: boolean) {
  dashboardStore.set((s) => ({
    ...s,
    products: s.products.map((p) => (p.id === id ? { ...p, active } : p)),
  }));
}

export function updateOrderStatus(id: string, status: OrderStatus) {
  dashboardStore.set((s) => ({
    ...s,
    orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
  }));
}

export function addOrder(order: AdminOrder) {
  dashboardStore.set((s) => ({ ...s, orders: [order, ...s.orders] }));
}

export function addProduct(product: AdminProduct) {
  dashboardStore.set((s) => ({ ...s, products: [product, ...s.products] }));
}

export function addExpense(expense: Expense) {
  dashboardStore.set((s) => ({ ...s, expenses: [expense, ...s.expenses] }));
}

export function addInvestment(investment: Investment) {
  dashboardStore.set((s) => ({ ...s, investments: [investment, ...s.investments] }));
}

export function addPurchase(purchase: Purchase) {
  dashboardStore.set((s) => ({ ...s, purchases: [purchase, ...s.purchases] }));
}

export function addNote(note: Note) {
  dashboardStore.set((s) => ({ ...s, notes: [note, ...s.notes] }));
}

export function toggleNotePin(id: string) {
  dashboardStore.set((s) => ({
    ...s,
    notes: s.notes.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n)),
  }));
}

export function deleteNote(id: string) {
  dashboardStore.set((s) => ({ ...s, notes: s.notes.filter((n) => n.id !== id) }));
}

export function addRole(role: Role) {
  dashboardStore.set((s) => ({ ...s, roles: [role, ...s.roles] }));
}
