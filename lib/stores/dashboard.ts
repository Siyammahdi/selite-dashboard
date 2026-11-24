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
  ProductCategory,
  Purchase,
  TeamMember,
} from "@/lib/types";

const STORAGE_KEY = "selite-dashboard-v2";
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

export function updateProduct(id: number, patch: Partial<AdminProduct>) {
  dashboardStore.set((s) => ({
    ...s,
    products: s.products.map((p) => (p.id === id ? { ...p, ...patch } : p)),
  }));
}

export function deleteProduct(id: number) {
  dashboardStore.set((s) => ({
    ...s,
    products: s.products.filter((p) => p.id !== id),
  }));
}

export function updateOrderStatus(id: string, status: OrderStatus) {
  dashboardStore.set((s) => ({
    ...s,
    orders: s.orders.map((o) => (o.id === id ? { ...o, status } : o)),
  }));
}

export function addCategory(category: ProductCategory) {
  dashboardStore.set((s) => ({ ...s, categories: [category, ...s.categories] }));
}

export function updateCategory(slug: string, patch: Partial<ProductCategory>) {
  dashboardStore.set((s) => ({
    ...s,
    categories: s.categories.map((c) => (c.slug === slug ? { ...c, ...patch } : c)),
    products:
      patch.name && patch.name !== s.categories.find((c) => c.slug === slug)?.name
        ? s.products.map((p) => (p.category === slug ? { ...p, categoryLabel: patch.name! } : p))
        : s.products,
  }));
}

export function deleteCategory(slug: string) {
  dashboardStore.set((s) => ({
    ...s,
    categories: s.categories.filter((c) => c.slug !== slug),
  }));
}

export function addOrder(order: AdminOrder) {
  dashboardStore.set((s) => ({ ...s, orders: [order, ...s.orders] }));
}

export function updateOrder(id: string, patch: Partial<AdminOrder>) {
  dashboardStore.set((s) => ({
    ...s,
    orders: s.orders.map((o) => (o.id === id ? { ...o, ...patch } : o)),
  }));
}

export function deleteOrder(id: string) {
  dashboardStore.set((s) => ({
    ...s,
    orders: s.orders.filter((o) => o.id !== id),
  }));
}

export function addProduct(product: AdminProduct) {
  dashboardStore.set((s) => ({ ...s, products: [product, ...s.products] }));
}

export function addExpense(expense: Expense) {
  dashboardStore.set((s) => ({ ...s, expenses: [expense, ...s.expenses] }));
}

export function updateExpense(id: string, patch: Partial<Expense>) {
  dashboardStore.set((s) => ({
    ...s,
    expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)),
  }));
}

export function deleteExpense(id: string) {
  dashboardStore.set((s) => ({
    ...s,
    expenses: s.expenses.filter((e) => e.id !== id),
  }));
}

export function addInvestment(investment: Investment) {
  dashboardStore.set((s) => ({ ...s, investments: [investment, ...s.investments] }));
}

export function updateInvestment(id: string, patch: Partial<Investment>) {
  dashboardStore.set((s) => ({
    ...s,
    investments: s.investments.map((i) => (i.id === id ? { ...i, ...patch } : i)),
  }));
}

export function deleteInvestment(id: string) {
  dashboardStore.set((s) => ({
    ...s,
    investments: s.investments.filter((i) => i.id !== id),
  }));
}

export function addPurchase(purchase: Purchase) {
  dashboardStore.set((s) => ({ ...s, purchases: [purchase, ...s.purchases] }));
}

export function updatePurchase(id: string, patch: Partial<Purchase>) {
  dashboardStore.set((s) => ({
    ...s,
    purchases: s.purchases.map((p) => (p.id === id ? { ...p, ...patch } : p)),
  }));
}

export function deletePurchase(id: string) {
  dashboardStore.set((s) => ({
    ...s,
    purchases: s.purchases.filter((p) => p.id !== id),
  }));
}

export function addNote(note: Note) {
  dashboardStore.set((s) => ({ ...s, notes: [note, ...s.notes] }));
}

export function updateNote(id: string, patch: Partial<Note>) {
  dashboardStore.set((s) => ({
    ...s,
    notes: s.notes.map((n) => (n.id === id ? { ...n, ...patch } : n)),
  }));
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

export function addTeamMember(member: TeamMember) {
  dashboardStore.set((s) => ({ ...s, teamMembers: [member, ...s.teamMembers] }));
}

export function updateTeamMember(id: string, patch: Partial<TeamMember>) {
  dashboardStore.set((s) => ({
    ...s,
    teamMembers: s.teamMembers.map((m) => (m.id === id ? { ...m, ...patch } : m)),
  }));
}

export function deleteTeamMember(id: string) {
  dashboardStore.set((s) => ({
    ...s,
    teamMembers: s.teamMembers.filter((m) => m.id !== id),
  }));
}
