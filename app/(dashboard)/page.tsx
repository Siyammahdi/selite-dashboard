import { Suspense } from "react";
import { OverviewView } from "@/components/overview/overview-view";

export default function OverviewPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-ink/60">Loading overview…</div>}>
      <OverviewView />
    </Suspense>
  );
}
