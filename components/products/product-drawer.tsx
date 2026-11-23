"use client";

import { useRef, useState } from "react";
import { categories, getCatalogProduct, getCategoryName, type CategorySlug } from "@/lib/catalog";
import { Drawer, DrawerActions } from "@/components/ui/drawer";
import { FieldShell, NumberInput, SelectField, TextArea, TextInput } from "@/components/ui/form-fields";
import { CloseIcon, ImageUploadIcon, PlusIcon, StarIcon, TrashIcon } from "@/components/ui/icons";
import { Stepper } from "@/components/ui/stepper";
import { parseMoney, slugify } from "@/lib/form-utils";
import { addProduct, deleteProduct, updateProduct } from "@/lib/stores/dashboard";
import { pushToast } from "@/lib/stores/ui";
import type { AdminProduct, ProductReview } from "@/lib/types";

const STEPS = ["Details", "Description", "Review", "Return"] as const;

type ProductDrawerProps = {
  open: boolean;
  product?: AdminProduct | null;
  onClose: () => void;
};

function productDefaults(product?: AdminProduct | null) {
  if (product) {
    const catalog = getCatalogProduct(product.id);
    return {
      name: product.name,
      category: product.category,
      metaDescription: product.metaDescription ?? "",
      sellingPrice: String(product.sellingPrice),
      purchasePrice: String(product.purchasePrice),
      stock: String(product.stock),
      lowStockThreshold: String(product.lowStockThreshold ?? 5),
      active: product.active,
      images: product.images && product.images.length > 0 ? product.images : [product.image],
      internalNotes: product.internalNotes ?? "",
      code: product.code,
      description: product.description ?? catalog?.description.join("\n\n") ?? "",
      reviews: product.reviews ?? [],
      returnPolicy:
        product.returnPolicy ??
        "Unused items can be returned within 7 days of delivery with original packaging.",
    };
  }
  return {
    name: "",
    category: "womens-bags" as CategorySlug,
    metaDescription: "",
    sellingPrice: "",
    purchasePrice: "",
    stock: "10",
    lowStockThreshold: "5",
    active: true,
    images: ["/images/product-thumb-1.png"],
    internalNotes: "",
    code: `NEW${Date.now().toString().slice(-4)}`,
    description: "",
    reviews: [] as ProductReview[],
    returnPolicy: "Unused items can be returned within 7 days of delivery.",
  };
}

function readFileAsDataUrl(file: File): Promise<string> {
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

function ImageTile({
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

function RatingInput({ value, onChange }: { value: number; onChange: (value: number) => void }) {
  return (
    <div className="flex h-[42px] items-center gap-1 rounded border border-stone bg-white px-3">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          aria-label={`${n} star${n > 1 ? "s" : ""}`}
          className={n <= value ? "text-flame" : "text-stone"}
        >
          <StarIcon className="size-4" filled={n <= value} />
        </button>
      ))}
    </div>
  );
}

function ReviewCard({
  review,
  onChange,
  onRemove,
}: {
  review: ProductReview;
  onChange: (patch: Partial<ProductReview>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-lg bg-[#fcf2e3] p-2">
      <TextInput label="Reviewer name" value={review.name} onChange={(v) => onChange({ name: v })} />
      <div className="grid grid-cols-2 gap-4">
        <TextInput label="Profession" value={review.profession} onChange={(v) => onChange({ profession: v })} />
        <FieldShell label="Rating">
          <RatingInput value={review.rating} onChange={(v) => onChange({ rating: v })} />
        </FieldShell>
      </div>
      <div className="flex items-end justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="text-sm text-ink">Person Image</span>
          <div className="w-[106px]">
            <ImageTile src={review.image || undefined} onPick={(dataUrl) => onChange({ image: dataUrl })} />
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove review"
          className="flex size-7 shrink-0 items-center justify-center rounded text-ink/60 transition hover:bg-white hover:text-[#d00036]"
        >
          <TrashIcon className="size-4" />
        </button>
      </div>
    </div>
  );
}

export function ProductDrawer({ open, product, onClose }: ProductDrawerProps) {
  if (!open) return null;
  return <ProductDrawerForm key={product?.id ?? "create"} product={product} onClose={onClose} />;
}

function ProductDrawerForm({
  product,
  onClose,
}: {
  product?: AdminProduct | null;
  onClose: () => void;
}) {
  const editing = Boolean(product);
  const initial = productDefaults(product);
  const [stepIndex, setStepIndex] = useState(0);
  const [name, setName] = useState(initial.name);
  const [category, setCategory] = useState<CategorySlug>(initial.category);
  const [metaDescription, setMetaDescription] = useState(initial.metaDescription);
  const [sellingPrice, setSellingPrice] = useState(initial.sellingPrice);
  const [purchasePrice, setPurchasePrice] = useState(initial.purchasePrice);
  const [stock, setStock] = useState(initial.stock);
  const [lowStockThreshold, setLowStockThreshold] = useState(initial.lowStockThreshold);
  const [active, setActive] = useState(initial.active);
  const [images, setImages] = useState<string[]>(initial.images);
  const [internalNotes, setInternalNotes] = useState(initial.internalNotes);
  const [description, setDescription] = useState(initial.description);
  const [reviews, setReviews] = useState<ProductReview[]>(initial.reviews);
  const [returnPolicy, setReturnPolicy] = useState(initial.returnPolicy);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validateDetails() {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Product name is required";
    if (!parseMoney(sellingPrice)) next.sellingPrice = "Enter selling price";
    if (!parseMoney(purchasePrice) && purchasePrice !== "0") next.purchasePrice = "Enter purchase price";
    if (stock === "" || Number.isNaN(Number(stock))) next.stock = "Enter stock quantity";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function updateReview(id: string, patch: Partial<ProductReview>) {
    setReviews((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  function addReview() {
    setReviews((prev) => [...prev, { id: `review-${Date.now()}`, name: "", profession: "", rating: 5, image: "" }]);
  }

  function removeReview(id: string) {
    setReviews((prev) => prev.filter((r) => r.id !== id));
  }

  function handleSave() {
    if (!validateDetails()) {
      setStepIndex(0);
      pushToast("Complete product details", "error");
      return;
    }

    const payload: AdminProduct = {
      id: product?.id ?? Date.now(),
      slug: product?.slug ?? (slugify(name) || `product-${Date.now()}`),
      name: name.trim(),
      category,
      categoryLabel: getCategoryName(category),
      image: images[0] ?? "/images/product-thumb-1.png",
      images,
      code: product?.code ?? initial.code,
      stock: Math.max(0, Math.floor(parseMoney(stock))),
      lowStockThreshold: Math.max(0, Math.floor(parseMoney(lowStockThreshold)) || 5),
      unitsSold: product?.unitsSold ?? 0,
      sellingPrice: parseMoney(sellingPrice),
      purchasePrice: parseMoney(purchasePrice),
      active,
      rating: product?.rating ?? 5,
      description: description.trim(),
      metaDescription: metaDescription.trim(),
      internalNotes: internalNotes.trim(),
      reviews,
      returnPolicy: returnPolicy.trim(),
    };

    if (editing && product) {
      updateProduct(product.id, payload);
      pushToast("Product updated");
    } else {
      addProduct(payload);
      pushToast("Product added to collection");
    }
    onClose();
  }

  function handleDelete() {
    if (!product) return;
    if (!window.confirm(`Delete product “${product.name}”?`)) return;
    deleteProduct(product.id);
    pushToast("Product deleted", "info");
    onClose();
  }

  const step = STEPS[stepIndex];

  return (
    <Drawer
      open
      title={editing ? "Edit Product" : "Add New Item"}
      onClose={onClose}
      footer={
        <DrawerActions
          onSave={handleSave}
          onCancel={onClose}
          onDelete={editing ? handleDelete : undefined}
          deleteLabel="Delete"
        />
      }
    >
      <div className="flex h-full flex-col">
        <div className="pb-4">
          <Stepper steps={STEPS} current={stepIndex} onSelect={setStepIndex} />
        </div>

        {step === "Details" ? (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="flex flex-col gap-2 pb-4">
              <TextInput label="Product Name" value={name} onChange={setName} error={errors.name} />
              <TextArea label="Meta Description" rows={3} value={metaDescription} onChange={setMetaDescription} />
              <SelectField
                label="Category"
                value={category}
                onChange={(v) => setCategory(v as CategorySlug)}
                options={categories.map((c) => ({ value: c.slug, label: c.name }))}
              />
              <div className="grid grid-cols-2 gap-4">
                <NumberInput
                  label="Selling Price"
                  min={0}
                  value={sellingPrice}
                  onChange={setSellingPrice}
                  error={errors.sellingPrice}
                />
                <NumberInput
                  label="Purchase Price"
                  min={0}
                  value={purchasePrice}
                  onChange={setPurchasePrice}
                  error={errors.purchasePrice}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <NumberInput
                  label="Available Stock"
                  min={0}
                  value={stock}
                  onChange={setStock}
                  error={errors.stock}
                />
                <NumberInput label="Low Stock Count" min={0} value={lowStockThreshold} onChange={setLowStockThreshold} />
              </div>
              <SelectField
                label="Activity Status"
                value={active ? "active" : "inactive"}
                onChange={(v) => setActive(v === "active")}
                options={[
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ]}
              />
              <FieldShell label="Product Image">
                <div className="grid grid-cols-4 gap-2">
                  {images.map((src, index) => (
                    <ImageTile
                      key={`${src}-${index}`}
                      src={src}
                      onPick={() => {}}
                      onRemove={
                        images.length > 1
                          ? () => setImages((prev) => prev.filter((_, i) => i !== index))
                          : undefined
                      }
                    />
                  ))}
                  <ImageTile onPick={(dataUrl) => setImages((prev) => [...prev, dataUrl])} />
                </div>
              </FieldShell>
              <TextArea label="Internal notes" rows={3} value={internalNotes} onChange={setInternalNotes} />
            </div>
          </div>
        ) : null}

        {step === "Description" ? (
          <TextArea label="Description" value={description} onChange={setDescription} fill />
        ) : null}

        {step === "Review" ? (
          <div className="min-h-0 flex-1 overflow-y-auto">
            <div className="flex flex-col gap-3 pb-4">
              {reviews.length === 0 ? (
                <p className="rounded-lg border border-dashed border-stone p-4 text-center text-sm text-ink/60">
                  No reviews added yet.
                </p>
              ) : (
                reviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    onChange={(patch) => updateReview(review.id, patch)}
                    onRemove={() => removeReview(review.id)}
                  />
                ))
              )}
              <button
                type="button"
                onClick={addReview}
                className="flex items-center gap-2 self-start rounded-md px-1 py-1 text-sm text-ink transition hover:text-forest"
              >
                <PlusIcon className="size-2.5" />
                Add New
              </button>
            </div>
          </div>
        ) : null}

        {step === "Return" ? (
          <TextArea label="Return Policy" value={returnPolicy} onChange={setReturnPolicy} fill />
        ) : null}
      </div>
    </Drawer>
  );
}
