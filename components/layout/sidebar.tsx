"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "@/lib/nav";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-0 flex h-dvh w-[253px] shrink-0 flex-col bg-ink px-[18px] pt-[22px]">
      <Link href="/" className="mx-auto mb-[38px] block w-[121px]">
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
              className={`flex items-center gap-2.5 rounded px-2.5 py-1.5 text-base tracking-[-0.04em] ${
                active ? "bg-lime text-ink" : "bg-ink text-white hover:bg-white/5"
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
  );
}
