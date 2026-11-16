import { Suspense } from "react";
import { ProductsView } from "@/components/products/products-view";

export default function ProductsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-ink/60">Loading products…</div>}>
      <ProductsView />
    </Suspense>
  );
}
