"use client";

import Image from "next/image";
import { formatAmount } from "@/lib/format";
import type { AdminOrder } from "@/lib/types";

type InvoiceModalProps = {
  open: boolean;
  order: AdminOrder | null;
  onClose: () => void;
};

export function InvoiceModal({ open, order, onClose }: InvoiceModalProps) {
  if (!open || !order) return null;
  const orderDate = new Date(order.createdAt).toISOString().slice(0, 10);
  const deliveryCharge = Math.round(order.deliveryCharge);

  return (
    <div className="animate-fade-in fixed inset-0 z-[90] flex justify-center overflow-y-auto bg-ink/60 p-4">
      <div className="flex w-full max-w-[650px] flex-col gap-4 pb-10">
        <div className="flex items-center justify-end gap-2 print:hidden">
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg bg-forest px-4 py-2.5 text-sm font-semibold text-lime transition hover:bg-ink"
          >
            Print / Save as PDF
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-snow"
          >
            Close
          </button>
        </div>

        <div className="print-only animate-scale-in flex flex-col gap-6 rounded-lg bg-white p-8 text-ink shadow-2xl print:rounded-none print:p-10 print:shadow-none">
          <div className="flex items-start justify-between gap-4">
            <Image src="/icons/logo-sidebar.svg" alt="Selite Lifestyle" width={113} height={41} />
            <div className="text-right text-sm">
              <p>
                <span className="font-bold">Invoice No: </span>#{order.id}
              </p>
              <p>
                <span className="font-bold">Order Date: </span>
                {orderDate}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-bold">Name:</p>
              <p>{order.customer}</p>
            </div>
            <div>
              <p className="font-bold">Phone:</p>
              <p>{order.phone}</p>
            </div>
            <div>
              <p className="font-bold">Delivery Address:</p>
              <p>{order.address}</p>
            </div>
          </div>

          <table className="w-full border-collapse border border-ink text-sm">
            <thead>
              <tr className="border-b border-ink text-left text-lg font-bold">
                <th className="w-[55%] px-3 py-3">Product</th>
                <th className="w-[23%] border-l border-ink px-3 py-3">Quantity</th>
                <th className="w-[22%] border-l border-ink px-3 py-3">Price</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b border-ink">
                  <td className="px-3 py-2.5">{item.name}</td>
                  <td className="border-l border-ink px-3 py-2.5">
                    {item.quantity} x {formatAmount(item.price)} Tk
                  </td>
                  <td className="border-l border-ink px-3 py-2.5">{formatAmount(item.price * item.quantity)} Tk</td>
                </tr>
              ))}
              <tr>
                <td rowSpan={2} className="align-top px-3 py-2.5">
                  Customer Note:
                  {order.notes ? <span className="mt-1 block text-ink/80">{order.notes}</span> : null}
                </td>
                <td className="border-t border-l border-ink px-3 py-2.5">Delivery Charge</td>
                <td className="border-t border-l border-ink px-3 py-2.5">{formatAmount(order.deliveryCharge)} Tk</td>
              </tr>
              <tr>
                <td className="border-t border-l border-ink px-3 py-2.5 font-bold">Total</td>
                <td className="border-t border-l border-ink px-3 py-2.5 font-bold">{formatAmount(order.amount)} Tk</td>
              </tr>
            </tbody>
          </table>

          <p className="text-xs leading-relaxed">
            বিঃদ্রঃ- ছবি এবং বর্ণনার সাথে পণ্যের মিল থাকা সত্যেও আপনি পণ্য গ্রহন করতে না চাইলে কুরিয়ার চার্জ {deliveryCharge} টাকা
            ডেলিভারি ম্যানকে প্রদান করে পণ্য সাথে সাথে রিটার্ন করবেন। পরে কোন কমপ্লেইন/রিটার্ন গ্রহণযোগ্য নয়!
          </p>
        </div>
      </div>
    </div>
  );
}
