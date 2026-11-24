"use client";

import { useRef } from "react";
import { CloseIcon, ImageUploadIcon } from "@/components/ui/icons";

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") resolve(reader.result);
      else reject(new Error("Could not read file"));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function ImageTile({
  src,
  onPick,
  onRemove,
  label = "Upload Image",
}: {
  src?: string;
  onPick: (dataUrl: string) => void;
  onRemove?: () => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    onPick(await readFileAsDataUrl(file));
  }

  if (src) {
    return (
      <div className="group relative aspect-[105/86] overflow-hidden rounded-lg border border-stone bg-stone">
        {/* eslint-disable-next-line @next/next/no-img-element -- locally uploaded data: URLs, not optimizable assets */}
        <img src={src} alt="" className="size-full object-cover" />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          aria-label="Replace image"
          className="absolute inset-0 flex items-center justify-center bg-ink/0 text-white opacity-0 transition group-hover:bg-ink/30 group-hover:opacity-100"
        >
          <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
          <span className="text-xs font-medium">Replace</span>
        </button>
        {onRemove ? (
          <button
            type="button"
            onClick={onRemove}
            aria-label="Remove image"
            className="absolute top-1 right-1 flex size-5 items-center justify-center rounded-full bg-ink/70 text-white opacity-0 transition group-hover:opacity-100"
          >
            <CloseIcon className="size-2.5" />
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className="flex aspect-[105/86] flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-stone bg-white text-ink/60 transition hover:border-forest hover:text-forest"
    >
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
      <ImageUploadIcon className="size-5" />
      <span className="text-xs">{label}</span>
    </button>
  );
}
