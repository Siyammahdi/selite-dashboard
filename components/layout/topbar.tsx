"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { pageTitles } from "@/lib/nav";

export function Topbar() {
  const pathname = usePathname();
  const title = pageTitles[pathname] ?? "Dashboard";

  return (
    <header className="flex h-[66px] items-center justify-between border-b border-stone bg-white py-3 pr-10 pl-4">
      <p className="text-base font-medium tracking-[-0.04em] text-ink">{title}</p>
      <button type="button" className="relative h-[42px] w-[62px]" aria-label="Account menu">
        <Image src="/icons/user-menu.png" alt="" width={62} height={42} className="h-[42px] w-[62px]" />
      </button>
    </header>
  );
}
