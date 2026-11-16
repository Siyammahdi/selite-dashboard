"use client";

import { createStore } from "@/lib/stores/create-store";

export type Toast = {
  id: string;
  message: string;
  tone?: "success" | "info" | "error";
};

type UiState = {
  sidebarOpen: boolean;
  toasts: Toast[];
};

export const uiStore = createStore<UiState>({
  sidebarOpen: false,
  toasts: [],
});

export function useUi() {
  return uiStore.useValue();
}

export function setSidebarOpen(open: boolean) {
  uiStore.set((s) => ({ ...s, sidebarOpen: open }));
}

export function toggleSidebar() {
  uiStore.set((s) => ({ ...s, sidebarOpen: !s.sidebarOpen }));
}

export function pushToast(message: string, tone: Toast["tone"] = "success") {
  const id = `t-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  uiStore.set((s) => ({ ...s, toasts: [...s.toasts, { id, message, tone }] }));
  window.setTimeout(() => {
    uiStore.set((s) => ({ ...s, toasts: s.toasts.filter((t) => t.id !== id) }));
  }, 2800);
}
