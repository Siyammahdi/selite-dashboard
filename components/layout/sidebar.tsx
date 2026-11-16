"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/nav";
import { setSidebarOpen, useUi } from "@/lib/stores/ui";

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen } = useUi();

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-ink/40 transition lg:hidden ${
          sidebarOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex h-dvh w-[253px] shrink-0 flex-col bg-ink px-[18px] pt-[22px] transition-transform duration-300 ease-out lg:sticky lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <Link href="/" className="mx-auto mb-[38px] block w-[121px]" onClick={() => setSidebarOpen(false)}>
          <Image
            src="/icons/logo-sidebar.svg"
            alt="Selite Lifestyle"
            width={121}
            height={44}
            className="h-11 w-[121px]"
            priority
          />
        </Link>

        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-2.5 rounded px-2.5 py-1.5 text-base tracking-[-0.04em] transition-all duration-200 ${
                  active
                    ? "bg-lime text-ink shadow-[0_0_0_1px_rgba(219,252,147,0.35)]"
                    : "bg-ink text-white hover:translate-x-0.5 hover:bg-white/5"
                }`}
              >
                <Image
                  src={item.icon}
                  alt=""
                  width={24}
                  height={24}
                  className={`size-6 ${active ? "brightness-0" : ""}`}
                />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
