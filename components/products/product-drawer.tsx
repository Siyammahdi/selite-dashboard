"use client";

import { useEffect, useState } from "react";
import { categories, getCatalogProduct, getCategoryName, type CategorySlug } from "@/lib/catalog";
import { Drawer, DrawerActions } from "@/components/ui/drawer";
import { NumberInput, SelectField, TextArea, TextInput } from "@/components/ui/form-fields";
import { parseMoney, slugify } from "@/lib/form-utils";
import {
  addProduct,
  deleteProduct,
  updateProduct,
} from "@/lib/stores/dashboard";
import { pushToast } from "@/lib/stores/ui";
import type { AdminProduct } from "@/lib/types";

const STEPS = ["Details", "Description", "Review", "Return"] as const;

type ProductDrawerProps = {
  open: boolean;
  product?: AdminProduct | null;
  onClose: () => void;
};

export function ProductDrawer({ open, product, onClose }: ProductDrawerProps) {
  const editing = Boolean(product);
  const [step, setStep] = useState<(typeof STEPS)[number]>("Details");
  const [name, setName] = useState("");
  const [category, setCategory] = useState<CategorySlug>("womens-bags");
  const [sellingPrice, setSellingPrice] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [stock, setStock] = useState("");
  const [code, setCode] = useState("");
  const [image, setImage] = useState("/images/product-thumb-1.png");
  const [description, setDescription] = useState("");
  const [reviewPolicy, setReviewPolicy] = useState("");
  const [returnPolicy, setReturnPolicy] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!open) return;
    if (product) {
      const catalog = getCatalogProduct(product.id);
      setName(product.name);
      setCategory(product.category);
      setSellingPrice(String(product.sellingPrice));
      setPurchasePrice(String(product.purchasePrice));
      setStock(String(product.stock));
      setCode(product.code);
      setImage(product.image);
      setDescription(product.description ?? catalog?.description.join("\n\n") ?? "");
      setReviewPolicy(
        product.reviewPolicy ??
          "Customers can leave a review after delivery. Ratings sync from the storefront catalog.",
      );
      setReturnPolicy(
        product.returnPolicy ??
          "Unused items can be returned within 7 days of delivery with original packaging.",
      );
    } else {
      setName("");
      setCategory("womens-bags");
      setSellingPrice("");
      setPurchasePrice("");
      setStock("10");
      setCode(`NEW${Date.now().toString().slice(-4)}`);
      setImage("/images/product-thumb-1.png");
      setDescription("");
      setReviewPolicy("Customers can leave a review after delivery.");
      setReturnPolicy("Unused items can be returned within 7 days of delivery.");
    }
    setStep("Details");
    setErrors({});
  }, [open, product]);

  function validateDetails() {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Product name is required";
    if (!parseMoney(sellingPrice)) next.sellingPrice = "Enter selling price";
    if (!parseMoney(purchasePrice) && purchasePrice !== "0") next.purchasePrice = "Enter purchase price";
    if (stock === "" || Number.isNaN(Number(stock))) next.stock = "Enter stock quantity";
    if (!code.trim()) next.code = "Product code is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSave() {
    if (!validateDetails()) {
      setStep("Details");
      pushToast("Complete product details", "error");
      return;
    }

    const payload: AdminProduct = {
      id: product?.id ?? Date.now(),
      slug: product?.slug ?? (slugify(name) || `product-${Date.now()}`),
      name: name.trim(),
      category,
      categoryLabel: getCategoryName(category),
      image,
      code: code.trim(),
      stock: Math.max(0, Math.floor(parseMoney(stock))),
      unitsSold: product?.unitsSold ?? 0,
      sellingPrice: parseMoney(sellingPrice),
      purchasePrice: parseMoney(purchasePrice),
      active: product?.active ?? true,
      rating: product?.rating ?? 5,
      description: description.trim(),
      reviewPolicy: reviewPolicy.trim(),
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
    deleteProduct(product.id);
    pushToast("Product deleted", "info");
    onClose();
  }

  return (
    <Drawer
      open={open}
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
      <div className="mb-3 flex gap-1 overflow-x-auto">
        {STEPS.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => setStep(item)}
            className={`rounded-md px-3 py-1.5 text-sm transition ${
              step === item ? "bg-forest text-lime" : "bg-snow text-ink hover:bg-stone/40"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {step === "Details" ? (
        <div className="flex flex-col gap-2 pb-4">
          <TextInput label="Product name" required value={name} onChange={setName} error={errors.name} />
          <SelectField
            label="Category"
            value={category}
            onChange={(v) => setCategory(v as CategorySlug)}
            options={categories.map((c) => ({ value: c.slug, label: c.name }))}
          />
          <div className="grid grid-cols-2 gap-2">
            <NumberInput
              label="Selling price"
              required
              min={0}
              value={sellingPrice}
              onChange={setSellingPrice}
              error={errors.sellingPrice}
            />
            <NumberInput
              label="Purchase price"
              required
              min={0}
              value={purchasePrice}
              onChange={setPurchasePrice}
              error={errors.purchasePrice}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <NumberInput label="Stock" required min={0} value={stock} onChange={setStock} error={errors.stock} />
            <TextInput label="Product code" required value={code} onChange={setCode} error={errors.code} />
          </div>
          <TextInput
            label="Image path"
            value={image}
            onChange={setImage}
            placeholder="/products/308-0.webp"
          />
          {image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={image} alt="" className="mt-1 h-24 w-24 rounded-lg border border-stone object-cover" />
          ) : null}
        </div>
      ) : null}

      {step === "Description" ? (
        <TextArea label="Description" rows={12} value={description} onChange={setDescription} />
      ) : null}

      {step === "Review" ? (
        <TextArea label="Review policy" rows={10} value={reviewPolicy} onChange={setReviewPolicy} />
      ) : null}

      {step === "Return" ? (
        <TextArea label="Return policy" rows={10} value={returnPolicy} onChange={setReturnPolicy} />
      ) : null}
    </Drawer>
  );
}
