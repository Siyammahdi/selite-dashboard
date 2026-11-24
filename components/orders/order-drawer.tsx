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
import { PlusIcon, TrashIcon } from "@/components/ui/icons";
import {
  dateInputFromIso,
  isoFromDateInput,
  parseMoney,
  todayInputValue,
} from "@/lib/form-utils";
import { formatTaka } from "@/lib/format";
import {
  addOrder,
  deleteOrder,
  updateOrder,
  useDashboard,
} from "@/lib/stores/dashboard";
import { pushToast } from "@/lib/stores/ui";
import type {
  AdminOrder,
  AdminProduct,
  OrderChannel,
  OrderItem,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/lib/types";

const STATUS_OPTIONS: OrderStatus[] = [
  "New Order",
  "In Process",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Return",
];

const CHANNEL_OPTIONS: OrderChannel[] = ["Website", "Facebook", "Instagram", "Phone", "Walk-in"];
const PAYMENT_STATUS: PaymentStatus[] = ["Unpaid", "Partial", "Paid"];
const PAYMENT_METHODS: PaymentMethod[] = ["COD", "bKash", "Nagad", "Card", "Bank Transfer"];
const COURIERS = ["Pathao", "Steadfast", "RedX", "Sundarban"];

type LineDraft = {
  key: string;
  productId: string;
  quantity: string;
};

type OrderDrawerProps = {
  open: boolean;
  order?: AdminOrder | null;
  onClose: () => void;
  /** Fires only when an order is actually created/updated, not on Cancel. */
  onSaved?: (order: AdminOrder) => void;
};

let lineSeq = 0;
function emptyLine(productId = ""): LineDraft {
  lineSeq += 1;
  return { key: `line-${lineSeq}`, productId, quantity: "1" };
}

function firstProductId(products: AdminProduct[]) {
  return String(products.find((p) => p.active)?.id ?? products[0]?.id ?? "");
}

function initialLines(order: AdminOrder | null | undefined, products: AdminProduct[]): LineDraft[] {
  if (order?.items.length) {
    return order.items.map((item) => ({
      key: `line-${item.id}-${item.quantity}`,
      productId: String(item.id),
      quantity: String(item.quantity),
    }));
  }
  return [emptyLine(firstProductId(products))];
}

export function OrderDrawer({ open, order, onClose, onSaved }: OrderDrawerProps) {
  if (!open) return null;
  return (
    <OrderDrawerForm
      key={order?.id ?? "create"}
      order={order}
      onClose={onClose}
      onSaved={onSaved}
    />
  );
}

function OrderDrawerForm({
  order,
  onClose,
  onSaved,
}: {
  order?: AdminOrder | null;
  onClose: () => void;
  onSaved?: (order: AdminOrder) => void;
}) {
  const { products } = useDashboard();
  const editing = Boolean(order);

  const [customer, setCustomer] = useState(order?.customer ?? "");
  const [phone, setPhone] = useState(order?.phone ?? "");
  const [email, setEmail] = useState(order?.email ?? "");
  const [orderDate, setOrderDate] = useState(
    order ? dateInputFromIso(order.createdAt) : todayInputValue(),
  );
  const [channel, setChannel] = useState<OrderChannel>(order?.channel ?? "Website");
  const [status, setStatus] = useState<OrderStatus>(order?.status ?? "New Order");
  const [shippingFee, setShippingFee] = useState(String(order?.deliveryCharge ?? 80));
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(order?.paymentStatus ?? "Unpaid");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(order?.paymentMethod ?? "COD");
  const [courier, setCourier] = useState(order?.courier ?? "Pathao");
  const [address, setAddress] = useState(order?.address ?? "");
  const [notes, setNotes] = useState(order?.notes ?? "");
  const [lines, setLines] = useState<LineDraft[]>(() => initialLines(order, products));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const builtItems = useMemo(() => {
    const items: OrderItem[] = [];
    for (const line of lines) {
      const product = products.find((p) => String(p.id) === line.productId);
      if (!product) continue;
      const quantity = Math.max(1, Math.floor(parseMoney(line.quantity)) || 1);
      items.push({
        id: product.id,
        name: product.name,
        price: product.sellingPrice,
        quantity,
        image: product.image,
      });
    }
    return items;
  }, [lines, products]);

  const subtotal = builtItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const deliveryCharge = Math.max(0, parseMoney(shippingFee));
  const total = subtotal + deliveryCharge;

  function validate() {
    const next: Record<string, string> = {};
    if (!customer.trim()) next.customer = "Customer name is required";
    if (!phone.trim()) next.phone = "Phone number is required";
    if (!email.trim()) next.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) next.email = "Enter a valid email";
    if (!address.trim()) next.address = "Delivery address is required";
    if (!builtItems.length) next.items = "Add at least one catalog item";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSave() {
    if (!validate()) {
      pushToast("Fill required fields", "error");
      return;
    }

    const category = builtItems[0]
      ? (products.find((p) => p.id === builtItems[0]!.id)?.categoryLabel ?? "General")
      : "General";

    const payload: AdminOrder = {
      id: order?.id ?? `SL${Date.now().toString().slice(-8)}`,
      createdAt: isoFromDateInput(orderDate),
      customer: customer.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      zone: deliveryCharge >= 100 ? "outside" : "inside",
      category,
      amount: total,
      courier,
      channel,
      status,
      paymentStatus,
      paymentMethod,
      notes: notes.trim(),
      items: builtItems,
      subtotal,
      deliveryCharge,
    };

    if (editing && order) {
      updateOrder(order.id, payload);
      pushToast(`Order #${order.id} updated`);
    } else {
      addOrder(payload);
      pushToast(`Order #${payload.id} created`);
    }
    onSaved?.(payload);
    onClose();
  }

  function handleDelete() {
    if (!order) return;
    if (!window.confirm(`Delete order #${order.id}?`)) return;
    deleteOrder(order.id);
    pushToast(`Order #${order.id} deleted`, "info");
    onClose();
  }

  const productOptions = useMemo(() => {
    const sorted = [...products].sort((a, b) => Number(b.active) - Number(a.active));
    return sorted.map((p) => ({
      value: String(p.id),
      label: `${p.name}${p.active ? "" : " (inactive)"} — ${formatTaka(p.sellingPrice)}`,
    }));
  }, [products]);

  return (
    <Drawer
      open
      title={editing ? `Edit Order #${order?.id}` : "Create New Order"}
      onClose={onClose}
      footer={
        <DrawerActions
          onSave={handleSave}
          onCancel={onClose}
          onDelete={editing ? handleDelete : undefined}
          saveLabel={editing ? "Save Change" : "Create Order"}
          deleteLabel="Delete Order"
        />
      }
    >
      <div className="flex flex-col gap-2 pb-4">
        <TextInput label="Customer name" required value={customer} onChange={setCustomer} error={errors.customer} />
        <TextInput label="Phone number" required value={phone} onChange={setPhone} error={errors.phone} />
        <TextInput label="Email" required type="email" value={email} onChange={setEmail} error={errors.email} />

        <div className="grid grid-cols-2 gap-2">
          <DateInput label="Order date" value={orderDate} onChange={setOrderDate} />
          <SelectField
            label="Channel"
            value={channel}
            onChange={(v) => setChannel(v as OrderChannel)}
            options={CHANNEL_OPTIONS.map((c) => ({ value: c, label: c }))}
          />
        </div>

        <div className="flex flex-col gap-2 rounded-md border border-stone/70 p-2">
          {lines.map((line, index) => (
            <div key={line.key} className="grid grid-cols-[minmax(0,1fr)_96px_auto] items-end gap-2">
              <SelectField
                className="min-w-0"
                label={index === 0 ? "Item name" : `Item ${index + 1}`}
                value={line.productId}
                onChange={(productId) =>
                  setLines((prev) => prev.map((l) => (l.key === line.key ? { ...l, productId } : l)))
                }
                options={
                  productOptions.length
                    ? productOptions
                    : [{ value: "", label: "No products available" }]
                }
              />
              <QuantityStepper
                label="Quantity"
                min={1}
                value={line.quantity}
                onChange={(quantity) =>
                  setLines((prev) => prev.map((l) => (l.key === line.key ? { ...l, quantity } : l)))
                }
              />
              <button
                type="button"
                className="mb-2 text-ink/50 transition hover:text-[#d00036]"
                aria-label="Remove item"
                disabled={lines.length === 1}
                onClick={() => setLines((prev) => prev.filter((l) => l.key !== line.key))}
              >
                <TrashIcon />
              </button>
            </div>
          ))}
          {errors.items ? <p className="text-xs text-[#d00036]">{errors.items}</p> : null}
          <button
            type="button"
            className="inline-flex w-fit items-center gap-2 rounded px-2 py-1 text-sm text-ink transition hover:bg-snow"
            onClick={() => setLines((prev) => [...prev, emptyLine(firstProductId(products))])}
          >
            Add another item
            <PlusIcon className="size-2.5" />
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-sm text-ink">Order status</span>
          <div className="flex flex-wrap gap-2">
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setStatus(option)}
                className={`rounded-md border px-3 py-1.5 text-xs transition ${
                  status === option
                    ? "border-forest bg-forest text-white"
                    : "border-stone bg-white text-ink hover:bg-snow"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <NumberInput label="Shipping Fee" min={0} value={shippingFee} onChange={setShippingFee} />
          <FieldReadonly label="Total Amount" value={formatTaka(total)} />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <SelectField
            label="Payment status"
            value={paymentStatus}
            onChange={(v) => setPaymentStatus(v as PaymentStatus)}
            options={PAYMENT_STATUS.map((s) => ({ value: s, label: s }))}
          />
          <SelectField
            label="Payment method"
            value={paymentMethod}
            onChange={(v) => setPaymentMethod(v as PaymentMethod)}
            options={PAYMENT_METHODS.map((s) => ({ value: s, label: s }))}
          />
        </div>

        <SelectField
          label="Courier"
          value={courier}
          onChange={setCourier}
          options={COURIERS.map((c) => ({ value: c, label: c }))}
        />

        <TextArea
          label="Delivery address"
          required
          rows={4}
          value={address}
          onChange={setAddress}
          error={errors.address}
        />
        <TextArea label="Internal notes" rows={3} value={notes} onChange={setNotes} />
      </div>
    </Drawer>
  );
}

function FieldReadonly({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex w-full flex-col gap-1">
      <span className="text-sm text-ink">{label}</span>
      <div className="flex h-[42px] items-center rounded border border-stone bg-snow px-3 text-sm font-medium text-ink">
        {value}
      </div>
    </div>
  );
}
