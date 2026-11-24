"use client";

import { useMemo, useState } from "react";
import { Drawer, DrawerActions } from "@/components/ui/drawer";
import {
  DateInput,
  NumberInput,
  QuantityStepper,
  SelectField,
  TextArea,
  TextInput,
} from "@/components/ui/form-fields";
import { DocumentIcon } from "@/components/ui/icons";
import { dateInputFromDisplay, displayDateFromInput, parseMoney, todayInputValue } from "@/lib/form-utils";
import { formatTaka } from "@/lib/format";
import {
  addPurchase,
  deletePurchase,
  updatePurchase,
  useDashboard,
} from "@/lib/stores/dashboard";
import { pushToast } from "@/lib/stores/ui";
import type { AdminProduct, Purchase } from "@/lib/types";

const BASE_PURCHASE_CATEGORIES = ["Product Purchase", "Marketing", "Accessories", "Others", "Salary"];

type PurchaseDrawerProps = {
  open: boolean;
  kind: "product" | "others";
  purchase?: Purchase | null;
  onClose: () => void;
};

function purchaseDefaults(kind: "product" | "others", products: AdminProduct[], purchase?: Purchase | null) {
  if (purchase) {
    return {
      name: purchase.product,
      productId: purchase.productId ? String(purchase.productId) : "",
      vendor: purchase.vendor,
      quantity: String(purchase.quantity),
      amount: String(purchase.purchasePrice),
      date: dateInputFromDisplay(purchase.date),
      category: purchase.category,
      details: purchase.details ?? "",
      notes: purchase.notes ?? "",
      documentName: purchase.documentName ?? "",
    };
  }
  const first = products[0];
  return {
    name: kind === "product" ? (first?.name.split("(")[0]?.trim() ?? "") : "",
    productId: kind === "product" && first ? String(first.id) : "",
    vendor: "",
    quantity: kind === "product" ? "10" : "1",
    amount: kind === "product" ? String(first?.purchasePrice ?? "") : "",
    date: todayInputValue(),
    category: kind === "product" ? (first?.categoryLabel ?? "Product Purchase") : "Others",
    details: "",
    notes: "",
    documentName: "",
  };
}

export function PurchaseDrawer({ open, kind, purchase, onClose }: PurchaseDrawerProps) {
  if (!open) return null;
  return (
    <PurchaseDrawerForm
      key={`${kind}-${purchase?.id ?? "create"}`}
      kind={kind}
      purchase={purchase}
      onClose={onClose}
    />
  );
}

function PurchaseDrawerForm({
  kind,
  purchase,
  onClose,
}: {
  kind: "product" | "others";
  purchase?: Purchase | null;
  onClose: () => void;
}) {
  const { products, categories } = useDashboard();
  const editing = Boolean(purchase);
  const initial = purchaseDefaults(kind, products, purchase);
  const [name, setName] = useState(initial.name);
  const [productId, setProductId] = useState(initial.productId);
  const [vendor, setVendor] = useState(initial.vendor);
  const [quantity, setQuantity] = useState(initial.quantity);
  const [amount, setAmount] = useState(initial.amount);
  const [date, setDate] = useState(initial.date);
  const [category, setCategory] = useState(initial.category);
  const [details, setDetails] = useState(initial.details);
  const [notes, setNotes] = useState(initial.notes);
  const [documentName, setDocumentName] = useState(initial.documentName);
  const [extraCategories, setExtraCategories] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const categoryOptions = useMemo(
    () =>
      [...new Set([...BASE_PURCHASE_CATEGORIES, ...categories.map((c) => c.name), ...extraCategories])].map((c) => ({
        value: c,
        label: c,
      })),
    [categories, extraCategories],
  );

  const productOptions = useMemo(
    () =>
      [...products]
        .sort((a, b) => Number(b.active) - Number(a.active))
        .map((p) => ({
          value: String(p.id),
          label: `${p.name} — cost ${formatTaka(p.purchasePrice)}`,
        })),
    [products],
  );

  function onProductChange(id: string) {
    setProductId(id);
    const product = products.find((p) => String(p.id) === id);
    if (!product) return;
    setName(product.name.split("(")[0]?.trim() ?? product.name);
    setAmount(String(product.purchasePrice));
    setCategory(product.categoryLabel);
  }

  function validate() {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Name is required";
    if (!vendor.trim()) next.vendor = "Vendor name is required";
    if (!parseMoney(quantity) || parseMoney(quantity) < 1) next.quantity = "Enter quantity";
    if (!parseMoney(amount)) next.amount = "Enter amount";
    if (!date) next.date = "Date is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSave() {
    if (!validate()) {
      pushToast("Fill required fields", "error");
      return;
    }

    const payload: Purchase = {
      id: purchase?.id ?? `PUR-${Date.now().toString().slice(-5)}`,
      productId: kind === "product" && productId ? Number(productId) : null,
      product: name.trim(),
      category,
      quantity: Math.max(1, Math.floor(parseMoney(quantity))),
      purchasePrice: parseMoney(amount),
      vendor: vendor.trim(),
      date: displayDateFromInput(date),
      kind: purchase?.kind ?? kind,
      details: details.trim(),
      notes: notes.trim(),
      documentName: documentName.trim() || undefined,
    };

    if (editing && purchase) {
      updatePurchase(purchase.id, payload);
      pushToast("Purchase updated");
    } else {
      addPurchase(payload);
      pushToast("Purchase recorded");
    }
    onClose();
  }

  function handleDelete() {
    if (!purchase) return;
    deletePurchase(purchase.id);
    pushToast("Purchase deleted", "info");
    onClose();
  }

  return (
    <Drawer
      open
      title={editing ? "Edit Purchase" : kind === "product" ? "New Purchase" : "Others Purchase"}
      onClose={onClose}
      footer={
        <DrawerActions
          onSave={handleSave}
          onCancel={onClose}
          onDelete={editing ? handleDelete : undefined}
          saveLabel={editing ? "Save Change" : "Add Purchase"}
          deleteLabel="Delete"
        />
      }
    >
      <div className="flex flex-col gap-2 pb-4">
        {kind === "product" || purchase?.kind === "product" ? (
          <SelectField
            label="Catalog product"
            value={productId}
            onChange={onProductChange}
            searchable
            options={
              productOptions.length
                ? productOptions
                : [{ value: "", label: "No products available" }]
            }
          />
        ) : null}

        <TextInput label="Name" required value={name} onChange={setName} error={errors.name} />

        <div className="grid grid-cols-2 gap-2">
          <TextInput label="Vendor Name" required value={vendor} onChange={setVendor} error={errors.vendor} />
          <QuantityStepper
            label="Quantity"
            min={1}
            value={quantity}
            onChange={setQuantity}
            error={errors.quantity}
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <NumberInput label="Amount" required min={0} value={amount} onChange={setAmount} error={errors.amount} />
          <DateInput label="Date" required value={date} onChange={setDate} error={errors.date} />
        </div>

        <SelectField
          label="Category"
          value={category}
          onChange={setCategory}
          options={categoryOptions}
          footerAction={{
            label: "Add New Category +",
            onClick: () => {
              const next = window.prompt("New category name");
              if (!next?.trim()) return;
              const nameValue = next.trim();
              setExtraCategories((prev) => [...prev, nameValue]);
              setCategory(nameValue);
              pushToast(`Category “${nameValue}” added`, "info");
            },
          }}
        />

        <TextArea label="Details" rows={5} value={details} onChange={setDetails} />
        <TextArea label="Internal notes" rows={3} value={notes} onChange={setNotes} />

        <div className="flex flex-col gap-1">
          <span className="text-sm text-ink">Document</span>
          <label className="flex h-[70px] w-[120px] cursor-pointer flex-col items-center justify-center gap-0.5 rounded border border-dashed border-ink bg-white px-2 py-3 transition hover:bg-snow">
            <DocumentIcon className="size-6 text-ink" />
            <span className="text-center text-sm text-ink">{documentName || "Add Document"}</span>
            <input
              type="file"
              className="hidden"
              onChange={(e) => setDocumentName(e.target.files?.[0]?.name ?? "")}
            />
          </label>
        </div>
      </div>
    </Drawer>
  );
}
