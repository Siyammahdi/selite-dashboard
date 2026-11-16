"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { logoutAction } from "@/app/actions/auth";
import { pageTitles } from "@/lib/nav";
import { toggleSidebar } from "@/lib/stores/ui";

export function Topbar() {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "Dashboard";
  const [menuOpen, setMenuOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-30 flex h-[66px] items-center justify-between border-b border-stone bg-white/95 py-3 pr-4 pl-4 backdrop-blur md:pr-10">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="inline-flex size-9 items-center justify-center rounded-md border border-stone lg:hidden"
          onClick={() => toggleSidebar()}
          aria-label="Open menu"
        >
          <span className="sr-only">Menu</span>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden>
            <path d="M3 5h12M3 9h12M3 13h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <p className="text-base font-medium tracking-[-0.04em] text-ink">{title}</p>
      </div>

      <div className="relative" ref={menuRef}>
        <button
          type="button"
          className="relative h-[42px] w-[62px] transition hover:opacity-90"
          aria-label="Account menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
        >
          <Image src="/icons/user-menu.png" alt="" width={62} height={42} className="h-[42px] w-[62px]" />
        </button>

        {menuOpen ? (
          <div className="animate-scale-in absolute right-0 mt-2 w-52 overflow-hidden rounded-lg border border-stone bg-white shadow-lg">
            <div className="border-b border-stone px-3 py-2">
              <p className="text-sm font-semibold text-ink">Admin</p>
              <p className="text-xs text-ink/60">admin@selitelifestyle.com</p>
            </div>
            <button
              type="button"
              disabled={pending}
              className="w-full px-3 py-2.5 text-left text-sm text-ink transition hover:bg-snow disabled:opacity-60"
              onClick={() => {
                setMenuOpen(false);
                startTransition(() => {
                  void logoutAction();
                });
              }}
            >
              {pending ? "Signing out…" : "Log out"}
            </button>
          </div>
        ) : null}
      </div>
    </header>
  );
}
