"use client";

import { useUi } from "@/lib/stores/ui";

const tones = {
  success: "bg-forest text-snow",
  info: "bg-ink text-snow",
  error: "bg-[#b42318] text-white",
} as const;

export function Toaster() {
  const { toasts } = useUi();
  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-[min(360px,calc(100vw-2rem))] flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`animate-toast-in pointer-events-auto rounded-lg px-4 py-3 text-sm shadow-lg ${tones[toast.tone ?? "success"]}`}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}
