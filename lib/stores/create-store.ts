"use client";

import { useEffect, useSyncExternalStore } from "react";

type Listener = () => void;

const noopSubscribe = () => () => {};

export function useHydrated() {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/**
 * Tiny external store. When `storageKey` is given the value is persisted to localStorage
 * after mount (never during SSR / first hydration paint).
 */
export function createStore<T>(initial: T, storageKey?: string) {
  let state = initial;
  let hydrated = !storageKey;
  const listeners = new Set<Listener>();

  function emit() {
    listeners.forEach((l) => l());
  }

  function hydrateFromStorage() {
    if (!storageKey || typeof window === "undefined") return false;
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (!raw) return false;
      const parsed = JSON.parse(raw) as T;
      // Merge over the seed defaults so fields added after a user's data was
      // last saved (e.g. a new top-level collection) don't come back undefined.
      state =
        parsed && typeof parsed === "object" && !Array.isArray(parsed)
          ? { ...initial, ...parsed }
          : parsed;
      return true;
    } catch {
      return false;
    }
  }

  function get() {
    return state;
  }

  function set(next: T | ((prev: T) => T)) {
    state = typeof next === "function" ? (next as (prev: T) => T)(state) : next;
    if (storageKey && hydrated && typeof window !== "undefined") {
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(state));
      } catch {
        // ignore quota errors
      }
    }
    emit();
  }

  function subscribe(listener: Listener) {
    listeners.add(listener);
    const onStorage = (e: StorageEvent) => {
      if (e.key === storageKey) {
        hydrateFromStorage();
        emit();
      }
    };
    if (storageKey) window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      if (storageKey) window.removeEventListener("storage", onStorage);
    };
  }

  function useValue() {
    const mounted = useHydrated();
    const value = useSyncExternalStore(subscribe, get, () => initial);

    useEffect(() => {
      if (!storageKey || hydrated) return;
      const changed = hydrateFromStorage();
      hydrated = true;
      if (changed) emit();
    }, []);

    // Keep SSR + hydration paint on the seed snapshot; apply localStorage after mount.
    if (storageKey && !mounted) return initial;
    return value;
  }

  return { get, set, subscribe, useValue };
}
