import type { CategorySlug } from "@/lib/catalog";

export type OrderStatus =
  | "New Order"
  | "In Process"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Return";

export type AdminProduct = {
  id: number;
  slug: string;
  name: string;
  category: CategorySlug;
  categoryLabel: string;
  image: string;
  code: string;
  stock: number;
  unitsSold: number;
  sellingPrice: number;
  purchasePrice: number;
  active: boolean;
  rating: number;
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
  address: string;
  zone: "inside" | "outside";
  category: string;
  amount: number;
  courier: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  deliveryCharge: number;
};

export type Expense = {
  id: string;
  name: string;
  category: "Product Purchase" | "Marketing" | "Accessories" | "Salary" | "Technical" | "Others";
  amount: number;
  date: string;
};

export type Investment = {
  id: string;
  name: string;
  category: string;
  amount: number;
  date: string;
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
