export type OrderStatus =
  | "New Order"
  | "In Process"
  | "Shipped"
  | "Delivered"
  | "Cancelled"
  | "Return";

export type Order = {
  id: string;
  customer: string;
  contact: string;
  category: string;
  amount: string;
  courier: string;
  status: OrderStatus;
};

export type Product = {
  name: string;
  category: string;
  stock: number;
  allTimeSell: number;
  sellingPrice: string;
  purchasePrice: string;
  active: boolean;
};

export type TopSell = {
  name: string;
  image: string;
  revenue: string;
  unitsSold: number;
};

export type Expense = {
  no: string;
  name: string;
  category: string;
  amount: string;
  date: string;
};

export type Purchase = {
  product: string;
  category: string;
  quantity: number;
  purchasePrice: string;
  vendor: string;
  date: string;
};

export const overviewStats = [
  {
    label: "Total Revenue",
    value: "৳125,500",
    delta: "12%",
    hint: "vs last month",
    tone: "butter" as const,
    showArrow: true,
  },
  {
    label: "Total Orders",
    value: "248",
    delta: "12%",
    hint: "vs last month",
    tone: "lime" as const,
    showArrow: true,
  },
  {
    label: "Total Products",
    value: "156",
    delta: "12%",
    hint: "new products added",
    tone: "aqua" as const,
    showArrow: false,
  },
  {
    label: "Today Order Delivered",
    value: "1,250",
    delta: "12%",
    hint: "vs last month",
    tone: "lilac" as const,
    showArrow: true,
  },
];

export const alertCards = [
  {
    title: "12 Orders Ready to Ship",
    description: "Orders packed and awaiting shipment",
    icon: "/icons/alert-ship.svg",
    tone: "lime" as const,
  },
  {
    title: "08 Orders Awaiting Processing",
    description: "New orders require your attention",
    icon: "/icons/alert-process.svg",
    tone: "flame" as const,
  },
  {
    title: "05 Products Low in Stock",
    description: "Restock these products soon",
    icon: "/icons/alert-stock.svg",
    tone: "lilac" as const,
  },
];

export const recentOrders: Order[] = Array.from({ length: 9 }, () => ({
  id: "#SL2026110001",
  customer: "Olivia Rhye",
  contact: "+880 1700 000001",
  category: "Ladies Bag",
  amount: "1125.00",
  courier: "Pathao",
  status: "New Order",
}));

export const orders: Order[] = [
  {
    id: "#MR202551566",
    customer: "Olivia Rhye",
    contact: "+880 1700 000001",
    category: "Ladies Bag",
    amount: "1515.00",
    courier: "Pathao",
    status: "Delivered",
  },
  {
    id: "#MR202551567",
    customer: "Olivia Rhye",
    contact: "+880 1700 000001",
    category: "Ladies Bag",
    amount: "1515.00",
    courier: "Pathao",
    status: "Shipped",
  },
  {
    id: "#MR202551568",
    customer: "Olivia Rhye",
    contact: "+880 1700 000001",
    category: "Ladies Bag",
    amount: "1515.00",
    courier: "Pathao",
    status: "Return",
  },
  {
    id: "#MR202551569",
    customer: "Olivia Rhye",
    contact: "+880 1700 000001",
    category: "Ladies Bag",
    amount: "1515.00",
    courier: "Pathao",
    status: "New Order",
  },
  {
    id: "#MR202551570",
    customer: "Olivia Rhye",
    contact: "+880 1700 000001",
    category: "Ladies Bag",
    amount: "1515.00",
    courier: "Pathao",
    status: "Delivered",
  },
  {
    id: "#MR202551571",
    customer: "Olivia Rhye",
    contact: "+880 1700 000001",
    category: "Ladies Bag",
    amount: "1515.00",
    courier: "Pathao",
    status: "Shipped",
  },
  {
    id: "#MR202551572",
    customer: "Olivia Rhye",
    contact: "+880 1700 000001",
    category: "Ladies Bag",
    amount: "1515.00",
    courier: "Pathao",
    status: "Return",
  },
  {
    id: "#MR202551573",
    customer: "Olivia Rhye",
    contact: "+880 1700 000001",
    category: "Ladies Bag",
    amount: "1515.00",
    courier: "Pathao",
    status: "New Order",
  },
];

export const orderTabs = [
  { label: "All", count: 120 },
  { label: "New Order", count: 75 },
  { label: "In Process", count: 75 },
  { label: "Shipped", count: 75 },
  { label: "Delivered", count: 75 },
  { label: "Cancelled", count: 75 },
  { label: "Return", count: 75 },
] as const;

export const topSells: TopSell[] = [
  {
    name: "Everyday Tote Bag",
    image: "/images/product-thumb-1.png",
    revenue: "$200",
    unitsSold: 85,
  },
  {
    name: "Cotton Cushion Cover",
    image: "/images/product-thumb-2.png",
    revenue: "$200",
    unitsSold: 85,
  },
  {
    name: "Classic Backpack",
    image: "/images/product-thumb-1.png",
    revenue: "$200",
    unitsSold: 85,
  },
  {
    name: "Travel Organizer",
    image: "/images/product-thumb-2.png",
    revenue: "$200",
    unitsSold: 85,
  },
  {
    name: "Mini Crossbody",
    image: "/images/product-thumb-1.png",
    revenue: "$200",
    unitsSold: 85,
  },
];

export const products: Product[] = [
  {
    name: "Classic Tote Bag",
    category: "Bags",
    stock: 15,
    allTimeSell: 15,
    sellingPrice: "700.00",
    purchasePrice: "100.00",
    active: true,
  },
  {
    name: "Classic Tote Bag",
    category: "Ladies Bag",
    stock: 15,
    allTimeSell: 15,
    sellingPrice: "700.00",
    purchasePrice: "1000.00",
    active: true,
  },
  {
    name: "Classic Tote Bag",
    category: "Bags",
    stock: 15,
    allTimeSell: 15,
    sellingPrice: "700.00",
    purchasePrice: "100.00",
    active: false,
  },
  {
    name: "Classic Tote Bag",
    category: "Ladies Bag",
    stock: 15,
    allTimeSell: 15,
    sellingPrice: "700.00",
    purchasePrice: "1000.00",
    active: true,
  },
  {
    name: "Classic Tote Bag",
    category: "Bags",
    stock: 15,
    allTimeSell: 15,
    sellingPrice: "700.00",
    purchasePrice: "100.00",
    active: true,
  },
  {
    name: "Classic Tote Bag",
    category: "Ladies Bag",
    stock: 15,
    allTimeSell: 15,
    sellingPrice: "700.00",
    purchasePrice: "1000.00",
    active: false,
  },
  {
    name: "Classic Tote Bag",
    category: "Bags",
    stock: 15,
    allTimeSell: 15,
    sellingPrice: "700.00",
    purchasePrice: "100.00",
    active: true,
  },
  {
    name: "Classic Tote Bag",
    category: "Ladies Bag",
    stock: 15,
    allTimeSell: 15,
    sellingPrice: "700.00",
    purchasePrice: "1000.00",
    active: true,
  },
  {
    name: "Classic Tote Bag",
    category: "Bags",
    stock: 15,
    allTimeSell: 15,
    sellingPrice: "700.00",
    purchasePrice: "100.00",
    active: true,
  },
  {
    name: "Classic Tote Bag",
    category: "Ladies Bag",
    stock: 15,
    allTimeSell: 15,
    sellingPrice: "700.00",
    purchasePrice: "1000.00",
    active: false,
  },
];

export const financeStats = [
  {
    label: "Total Revenue",
    value: "৳8,45,500",
    delta: "12%",
    hint: "vs last month",
    tone: "snow" as const,
  },
  {
    label: "Total Expenses",
    value: "৳3,25,000",
    delta: "12%",
    hint: "vs last month",
    tone: "butter" as const,
  },
  {
    label: "Total Investments",
    value: "৳1,50,000",
    delta: "12%",
    hint: "Across all investments",
    tone: "lime" as const,
  },
  {
    label: "Net Profit",
    value: "৳5,20,500",
    delta: "12%",
    hint: "vs last month",
    tone: "aqua" as const,
  },
];

export const expenses: Expense[] = Array.from({ length: 7 }, (_, i) => ({
  no: `EXP-00${i + 1}`,
  name: "Website Development",
  category: "Technical",
  amount: "2000.00",
  date: "12 Nov 2026",
}));

export const purchases: Purchase[] = [
  {
    product: "Bags",
    category: "Ladies Bag",
    quantity: 15,
    purchasePrice: "1000.00",
    vendor: "Atik- Deluxe Shop",
    date: "12 Nov 2026",
  },
  {
    product: "Bags",
    category: "Men’s Backpack",
    quantity: 10,
    purchasePrice: "750.00",
    vendor: "Urban Gear",
    date: "12 Nov 2026",
  },
  {
    product: "Bags",
    category: "Travel Suitcase",
    quantity: 8,
    purchasePrice: "1000.00",
    vendor: "Eco Friendly",
    date: "12 Nov 2026",
  },
  {
    product: "Bags",
    category: "Ladies Bag",
    quantity: 20,
    purchasePrice: "1000.00",
    vendor: "Atik- Deluxe Shop",
    date: "12 Nov 2026",
  },
  {
    product: "Bags",
    category: "Men’s Backpack",
    quantity: 12,
    purchasePrice: "750.00",
    vendor: "Urban Gear",
    date: "12 Nov 2026",
  },
  {
    product: "Bags",
    category: "Travel Suitcase",
    quantity: 6,
    purchasePrice: "1000.00",
    vendor: "Eco Friendly",
    date: "12 Nov 2026",
  },
  {
    product: "Bags",
    category: "Ladies Bag",
    quantity: 18,
    purchasePrice: "1000.00",
    vendor: "Atik- Deluxe Shop",
    date: "12 Nov 2026",
  },
  {
    product: "Bags",
    category: "Men’s Backpack",
    quantity: 9,
    purchasePrice: "750.00",
    vendor: "Urban Gear",
    date: "12 Nov 2026",
  },
];
