import type { OrderStatus } from "@/lib/data";

const styles: Record<OrderStatus, string> = {
  "New Order": "border-forest bg-snow text-forest",
  "In Process": "border-transparent bg-[#fff3e0] text-[#c56a00]",
  Shipped: "border-transparent bg-[#e8f4ff] text-[#1a6fb5]",
  Delivered: "border-transparent bg-[#e8f8e8] text-[#1f7a3f]",
  Cancelled: "border-transparent bg-[#fdecec] text-[#b42318]",
  Return: "border-transparent bg-[#fff0e6] text-flame",
};

const dots: Record<OrderStatus, string> = {
  "New Order": "bg-forest",
  "In Process": "bg-[#c56a00]",
  Shipped: "bg-[#1a6fb5]",
  Delivered: "bg-[#1f7a3f]",
  Cancelled: "bg-[#b42318]",
  Return: "bg-flame",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span
      className={`inline-flex h-7 items-center gap-2 rounded-lg border px-[7px] text-xs whitespace-nowrap ${styles[status]}`}
    >
      <span className={`size-2 rounded-full ${dots[status]}`} />
      {status}
    </span>
  );
}
