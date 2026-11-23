import type { CategorySlug } from "@/lib/catalog";

export type OrderStatus =
  | "New Order"
  | "In Process"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Return";

export type PaymentStatus = "Unpaid" | "Partial" | "Paid";
export type PaymentMethod = "COD" | "bKash" | "Nagad" | "Card" | "Bank Transfer";
export type OrderChannel = "Website" | "Facebook" | "Instagram" | "Phone" | "Walk-in";

export type ProductReview = {
  id: string;
  name: string;
  profession: string;
  rating: number;
  image: string;
};

export type AdminProduct = {
  id: number;
  slug: string;
  name: string;
  category: CategorySlug;
  categoryLabel: string;
  image: string;
  images?: string[];
  code: string;
  stock: number;
  lowStockThreshold?: number;
  unitsSold: number;
  sellingPrice: number;
  purchasePrice: number;
  active: boolean;
  rating: number;
  description?: string;
  metaDescription?: string;
  internalNotes?: string;
  reviews?: ProductReview[];
  returnPolicy?: string;
};

export type OrderItem = {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
};

export type AdminOrder = {
  id: string;
  createdAt: string;
  customer: string;
  phone: string;
  email?: string;
  address: string;
  zone: "inside" | "outside";
  category: string;
  amount: number;
  courier: string;
  channel?: OrderChannel;
  status: OrderStatus;
  paymentStatus?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  notes?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
};

export type ExpenseCategory =
  | "Product Purchase"
  | "Marketing"
  | "Accessories"
  | "Salary"
  | "Technical"
  | "Others";

export type Expense = {
  id: string;
  name: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  details?: string;
  notes?: string;
  documentName?: string;
};

export type Investment = {
  id: string;
  name: string;
  category: string;
  amount: number;
  date: string;
  details?: string;
  notes?: string;
};

export type Purchase = {
  id: string;
  productId: number | null;
  product: string;
  category: string;
  quantity: number;
  purchasePrice: number;
  vendor: string;
  date: string;
  kind: "product" | "others";
  details?: string;
  notes?: string;
  documentName?: string;
};

export type Note = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  pinned: boolean;
};

export type Role = {
  id: string;
  name: string;
  permissions: string[];
  members: number;
};

export type DashboardState = {
  products: AdminProduct[];
  orders: AdminOrder[];
  expenses: Expense[];
  investments: Investment[];
  purchases: Purchase[];
  notes: Note[];
  roles: Role[];
};
