export type ProductCategory = {
  slug: string;
  name: string;
  description?: string;
  image?: string;
  active: boolean;
  internalNotes?: string;
};

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
  category: string;
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

export const ACCESS_MODULES = ["orders", "products", "finance", "purchases", "notes"] as const;
export type AccessModule = (typeof ACCESS_MODULES)[number];

export const ACCESS_MODULE_LABELS: Record<AccessModule, string> = {
  orders: "Orders",
  products: "Products",
  finance: "Finance",
  purchases: "Purchases",
  notes: "Notes",
};

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  phone: string;
  password: string;
  /** Which sections this user can access. All modules present == full access. */
  access: AccessModule[];
  active: boolean;
};

export type DashboardState = {
  products: AdminProduct[];
  categories: ProductCategory[];
  orders: AdminOrder[];
  expenses: Expense[];
  investments: Investment[];
  purchases: Purchase[];
  notes: Note[];
  teamMembers: TeamMember[];
};
