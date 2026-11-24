"use client";

import { useState } from "react";
import { Drawer, DrawerActions } from "@/components/ui/drawer";
import { DateInput, NumberInput, SelectField, TextArea, TextInput } from "@/components/ui/form-fields";
import { DocumentIcon } from "@/components/ui/icons";
import { dateInputFromDisplay, displayDateFromInput, parseMoney, todayInputValue } from "@/lib/form-utils";
import {
  addExpense,
  addInvestment,
  deleteExpense,
  deleteInvestment,
  updateExpense,
  updateInvestment,
} from "@/lib/stores/dashboard";
import { pushToast } from "@/lib/stores/ui";
import type { Expense, ExpenseCategory, Investment } from "@/lib/types";

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Product Purchase",
  "Marketing",
  "Accessories",
  "Salary",
  "Technical",
  "Others",
];

const INVEST_CATEGORIES = ["Operations", "Inventory", "Marketing", "Equipment", "Others"];

type ExpenseDrawerProps = {
  open: boolean;
  mode: "expense" | "investment";
  record?: Expense | Investment | null;
  onClose: () => void;
};

function recordDefaults(mode: "expense" | "investment", record?: Expense | Investment | null) {
  const isExpense = mode === "expense";
  if (record) {
    return {
      name: record.name,
      amount: String(record.amount),
      date: dateInputFromDisplay(record.date),
      category: record.category,
      details: ("details" in record && record.details) || "",
      notes: ("notes" in record && record.notes) || "",
      documentName: ("documentName" in record && record.documentName) || "",
    };
  }
  return {
    name: "",
    amount: "",
    date: todayInputValue(),
    category: isExpense ? "Others" : "Operations",
    details: "",
    notes: "",
    documentName: "",
  };
}

export function ExpenseDrawer({ open, mode, record, onClose }: ExpenseDrawerProps) {
  if (!open) return null;
  return (
    <ExpenseDrawerForm
      key={`${mode}-${record?.id ?? "create"}`}
      mode={mode}
      record={record}
      onClose={onClose}
    />
  );
}

function ExpenseDrawerForm({
  mode,
  record,
  onClose,
}: {
  mode: "expense" | "investment";
  record?: Expense | Investment | null;
  onClose: () => void;
}) {
  const editing = Boolean(record);
  const isExpense = mode === "expense";
  const initial = recordDefaults(mode, record);
  const [name, setName] = useState(initial.name);
  const [amount, setAmount] = useState(initial.amount);
  const [date, setDate] = useState(initial.date);
  const [category, setCategory] = useState(initial.category);
  const [details, setDetails] = useState(initial.details);
  const [notes, setNotes] = useState(initial.notes);
  const [documentName, setDocumentName] = useState(initial.documentName);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const next: Record<string, string> = {};
    if (!name.trim()) next.name = "Name is required";
    if (!parseMoney(amount)) next.amount = "Enter a valid amount";
    if (!date) next.date = "Date is required";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSave() {
    if (!validate()) {
      pushToast("Fill required fields", "error");
      return;
    }

    const displayDate = displayDateFromInput(date);

    if (isExpense) {
      const payload: Expense = {
        id: record?.id ?? `EXP-${Date.now().toString().slice(-4)}`,
        name: name.trim(),
        category: category as ExpenseCategory,
        amount: parseMoney(amount),
        date: displayDate,
        details: details.trim(),
        notes: notes.trim(),
        documentName: documentName.trim() || undefined,
      };
      if (editing && record) {
        updateExpense(record.id, payload);
        pushToast("Expense updated");
      } else {
        addExpense(payload);
        pushToast("Expense added");
      }
    } else {
      const payload: Investment = {
        id: record?.id ?? `INV-${Date.now().toString().slice(-4)}`,
        name: name.trim(),
        category,
        amount: parseMoney(amount),
        date: displayDate,
        details: details.trim(),
        notes: notes.trim(),
      };
      if (editing && record) {
        updateInvestment(record.id, payload);
        pushToast("Investment updated");
      } else {
        addInvestment(payload);
        pushToast("Investment added");
      }
    }
    onClose();
  }

  function handleDelete() {
    if (!record) return;
    if (isExpense) {
      deleteExpense(record.id);
      pushToast("Expense deleted", "info");
    } else {
      deleteInvestment(record.id);
      pushToast("Investment deleted", "info");
    }
    onClose();
  }

  return (
    <Drawer
      open
      title={
        editing
          ? isExpense
            ? "Edit Expense"
            : "Edit Investment"
          : isExpense
            ? "Add New Expense"
            : "Add New Invest"
      }
      onClose={onClose}
      footer={
        <DrawerActions
          onSave={handleSave}
          onCancel={onClose}
          onDelete={editing ? handleDelete : undefined}
          saveLabel={editing ? "Save Change" : isExpense ? "Add Expense" : "Add Invest"}
          deleteLabel="Delete"
        />
      }
    >
      <div className="flex flex-col gap-2 pb-4">
        <TextInput
          label={isExpense ? "Expense Name" : "Investment Name"}
          required
          value={name}
          onChange={setName}
          error={errors.name}
        />
        <div className="grid grid-cols-2 gap-2">
          <NumberInput label="Amount" required min={0} value={amount} onChange={setAmount} error={errors.amount} />
          <DateInput label="Date" required value={date} onChange={setDate} error={errors.date} />
        </div>
        <SelectField
          label="Category"
          value={category}
          onChange={setCategory}
          options={(isExpense ? EXPENSE_CATEGORIES : INVEST_CATEGORIES).map((c) => ({
            value: c,
            label: c,
          }))}
        />
        <TextArea label="Details" rows={6} value={details} onChange={setDetails} />
        <TextArea label="Internal notes" rows={3} value={notes} onChange={setNotes} />

        {isExpense ? (
          <div className="flex flex-col gap-1">
            <span className="text-sm text-ink">Document</span>
            <label className="flex h-[70px] w-[120px] cursor-pointer flex-col items-center justify-center gap-0.5 rounded border border-dashed border-ink bg-white px-2 py-3 transition hover:bg-snow">
              <DocumentIcon className="size-6 text-ink" />
              <span className="text-sm text-ink">{documentName || "Add Document"}</span>
              <input
                type="file"
                className="hidden"
                onChange={(e) => setDocumentName(e.target.files?.[0]?.name ?? "")}
              />
            </label>
          </div>
        ) : null}
      </div>
    </Drawer>
  );
}
