import { Suspense } from "react";
import { OrdersView } from "@/components/orders/orders-view";

export default function OrdersPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-ink/60">Loading orders…</div>}>
      <OrdersView />
    </Suspense>
  );
}
