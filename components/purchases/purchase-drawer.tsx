"use client";

import { useEffect, useMemo, useState } from "react";
import { categories } from "@/lib/catalog";
import { Drawer, DrawerActions } from "@/components/ui/drawer";
import { DateInput, NumberInput, SelectField, TextArea, TextInput } from "@/components/ui/form-fields";
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
import type { Purchase } from "@/lib/types";

const PURCHASE_CATEGORIES = [
  "Product Purchase",
  "Marketing",
  "Accessories",
  "Others",
  "Salary",
  ...categories.map((c) => c.name),
];

type PurchaseDrawerProps = {
  open: boolean;
  kind: "product" | "others";
  purchase?: Purchase | null;
  onClose: () => void;
};

export function PurchaseDrawer({ open, kind, purchase, onClose }: PurchaseDrawerProps) {
  const { products } = useDashboard();
  const editing = Boolean(purchase);
  const [name, setName] = useState("");
  const [productId, setProductId] = useState("");
  const [vendor, setVendor] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [category, setCategory] = useState(kind === "product" ? "Product Purchase" : "Others");
  const [details, setDetails] = useState("");
  const [notes, setNotes] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const productOptions = useMemo(
    () =>
      products.map((p) => ({
        value: String(p.id),
        label: `${p.name} — cost ${formatTaka(p.purchasePrice)}`,
      })),
    [products],
  );

  useEffect(() => {
    if (!open) return;
    if (purchase) {
      setName(purchase.product);
      setProductId(purchase.productId ? String(purchase.productId) : "");
      setVendor(purchase.vendor);
      setQuantity(String(purchase.quantity));
      setAmount(String(purchase.purchasePrice));
      setCategory(purchase.category);
      setDetails(purchase.details ?? "");
      setNotes(purchase.notes ?? "");
      setDocumentName(purchase.documentName ?? "");
      setDate(dateInputFromDisplay(purchase.date));
    } else {
      const first = products[0];
      setName(kind === "product" ? (first?.name.split("(")[0]?.trim() ?? "") : "");
      setProductId(kind === "product" && first ? String(first.id) : "");
      setVendor("");
      setQuantity(kind === "product" ? "10" : "1");
      setAmount(kind === "product" ? String(first?.purchasePrice ?? "") : "");
      setDate(todayInputValue());
      setCategory(kind === "product" ? (first?.categoryLabel ?? "Product Purchase") : "Others");
      setDetails("");
      setNotes("");
      setDocumentName("");
    }
    setErrors({});
  }, [open, purchase, kind, products]);

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
      open={open}
      title={editing ? "Edit Purchase" : kind === "product" ? "New Purchase" : "Others Purchase"}
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
      <div className="flex flex-col gap-2 pb-4">
        {kind === "product" || purchase?.kind === "product" ? (
          <SelectField
            label="Catalog product"
            value={productId}
            onChange={onProductChange}
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
          <NumberInput
            label="Quantity"
            required
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
          options={[...new Set(PURCHASE_CATEGORIES)].map((c) => ({ value: c, label: c }))}
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
