import { catalog, distinctModels, getCategoryName, type CatalogProduct } from "@/lib/catalog";
import type {
  AdminOrder,
  AdminProduct,
  DashboardState,
  Expense,
  Investment,
  Note,
  OrderStatus,
  Purchase,
  Role,
} from "@/lib/types";

const COURIERS = ["Pathao", "Steadfast", "RedX", "Sundarban"] as const;
const CUSTOMERS = [
  ["Siyam Mahdi", "01712345678", "House 12, Road 5, Mohammadpur, Dhaka"],
  ["Olivia Rhye", "01700000001", "Banani, Dhaka"],
  ["Ayesha Rahman", "01883646120", "Dhanmondi 27, Dhaka"],
  ["Karim Hossain", "01911223344", "Chittagong Port Road"],
  ["Nusrat Jahan", "01699887766", "Uttara Sector 7"],
  ["Farhan Ahmed", "01555667788", "Mirpur 10, Dhaka"],
  ["Sadia Islam", "01350546435", "Gulshan 2, Dhaka"],
  ["Rafiul Hasan", "01766554433", "Sylhet Zindabazar"],
] as const;

const STATUSES: OrderStatus[] = [
  "New Order",
  "In Process",
  "Shipped",
  "Delivered",
  "Cancelled",
  "Return",
];

const VENDORS = ["Atik- Deluxe Shop", "Urban Gear", "Eco Friendly", "Dhaka Wholesale", "Bangla Source"];

function mulberry32(seed: number) {
  return function rand() {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(rand: () => number, list: readonly T[]) {
  return list[Math.floor(rand() * list.length)]!;
}

/** Fixed seed clock so SSR/prerender stays deterministic. */
const SEED_NOW = Date.parse("2026-11-16T12:00:00.000Z");

function dateDaysAgo(days: number) {
  return new Date(SEED_NOW - days * 86_400_000).toISOString();
}

function displayDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function buildAdminProducts(): AdminProduct[] {
  const models = distinctModels(catalog);
  return models.map((p) => {
    const rand = mulberry32(p.id * 97);
    const margin = 0.35 + rand() * 0.25;
    const purchasePrice = Math.max(50, Math.round((p.price * (1 - margin)) / 10) * 10);
    const stock = Math.floor(rand() * 40);
    const unitsSold = Math.floor(rand() * 180) + (stock < 5 ? 40 : 5);
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      category: p.category,
      categoryLabel: getCategoryName(p.category),
      image: p.images[0] ?? "/images/product-thumb-1.png",
      code: p.code,
      stock,
      unitsSold,
      sellingPrice: p.price,
      purchasePrice,
      active: rand() > 0.08,
      rating: p.rating,
    };
  });
}

function orderFromProduct(
  product: CatalogProduct,
  index: number,
  status: OrderStatus,
  daysAgo: number,
): AdminOrder {
  const rand = mulberry32(product.id * 13 + index * 17);
  const [customer, phone, address] = pick(rand, CUSTOMERS);
  const qty = 1 + Math.floor(rand() * 3);
  const zone = rand() > 0.55 ? "inside" : "outside";
  const deliveryCharge = zone === "inside" ? 80 : 120;
  const subtotal = product.price * qty;
  const createdAt = dateDaysAgo(daysAgo);
  return {
    id: `SL${2026110000 + index}`,
    createdAt,
    customer,
    phone: phone.startsWith("0") ? `+880 ${phone.slice(1, 5)} ${phone.slice(5)}` : phone,
    address,
    zone,
    category: getCategoryName(product.category),
    amount: subtotal + deliveryCharge,
    courier: pick(rand, COURIERS),
    status,
    items: [
      {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: qty,
        image: product.images[0],
      },
    ],
    subtotal,
    deliveryCharge,
  };
}

export function buildOrders(): AdminOrder[] {
  const pool = distinctModels(catalog);
  const realOrder: AdminOrder = {
    id: "SL-MWG4WWLUMRR",
    createdAt: "2026-11-14T08:19:17.394Z",
    customer: "Siyam Mahdi",
    phone: "+880 1712 345678",
    address: "House 12, Road 5, Mohammadpur, Dhaka",
    zone: "outside",
    category: getCategoryName("school-bags"),
    amount: 3090,
    courier: "Pathao",
    status: "New Order",
    items: [
      {
        id: 308,
        name: "Cute Casual Premium Kids School Backpack (Pink)",
        price: 990,
        quantity: 3,
        image: "/products/308-0.webp",
      },
    ],
    subtotal: 2970,
    deliveryCharge: 120,
  };

  const generated = Array.from({ length: 48 }, (_, i) => {
    const product = pool[i % pool.length]!;
    const status = STATUSES[i % STATUSES.length]!;
    return orderFromProduct(product, i + 1, status, (i % 28) + 1);
  });

  return [realOrder, ...generated];
}

export function buildPurchases(products: AdminProduct[]): Purchase[] {
  const active = products.filter((p) => p.active).slice(0, 40);
  const fixed = active.map((p, i) => {
    const rand = mulberry32(p.id + 400);
    const qty = 5 + Math.floor(rand() * 25);
    return {
      id: `PUR-${1000 + i}`,
      productId: p.id,
      product: p.name.split("(")[0]!.trim(),
      category: p.categoryLabel,
      quantity: qty,
      purchasePrice: p.purchasePrice,
      vendor: pick(rand, VENDORS),
      date: displayDate(dateDaysAgo((i % 20) + 1)),
      kind: "product" as const,
    };
  });

  const others: Purchase[] = [
    {
      id: "PUR-O-1",
      productId: null,
      product: "Packaging Materials",
      category: "Others",
      quantity: 200,
      purchasePrice: 15,
      vendor: "Box & Tape BD",
      date: displayDate(dateDaysAgo(3)),
      kind: "others",
    },
    {
      id: "PUR-O-2",
      productId: null,
      product: "Courier Bags",
      category: "Others",
      quantity: 500,
      purchasePrice: 8,
      vendor: "PackPro",
      date: displayDate(dateDaysAgo(7)),
      kind: "others",
    },
    {
      id: "PUR-O-3",
      productId: null,
      product: "Office Supplies",
      category: "Others",
      quantity: 1,
      purchasePrice: 4500,
      vendor: "Staples BD",
      date: displayDate(dateDaysAgo(12)),
      kind: "others",
    },
  ];

  return [...fixed, ...others];
}

export function buildExpenses(): Expense[] {
  return [
    { id: "EXP-001", name: "Website Development", category: "Technical", amount: 20000, date: displayDate(dateDaysAgo(5)) },
    { id: "EXP-002", name: "Facebook Ads", category: "Marketing", amount: 8500, date: displayDate(dateDaysAgo(2)) },
    { id: "EXP-003", name: "Staff Salary - November", category: "Salary", amount: 45000, date: displayDate(dateDaysAgo(1)) },
    { id: "EXP-004", name: "Bulk Bag Purchase", category: "Product Purchase", amount: 125000, date: displayDate(dateDaysAgo(8)) },
    { id: "EXP-005", name: "Packaging Accessories", category: "Accessories", amount: 3200, date: displayDate(dateDaysAgo(4)) },
    { id: "EXP-006", name: "Domain & Hosting", category: "Technical", amount: 4500, date: displayDate(dateDaysAgo(15)) },
    { id: "EXP-007", name: "Influencer Collab", category: "Marketing", amount: 12000, date: displayDate(dateDaysAgo(6)) },
    { id: "EXP-008", name: "Misc Logistics", category: "Others", amount: 2800, date: displayDate(dateDaysAgo(9)) },
    { id: "EXP-009", name: "Warehouse Rent", category: "Others", amount: 18000, date: displayDate(dateDaysAgo(10)) },
    { id: "EXP-010", name: "Product Photography", category: "Marketing", amount: 7500, date: displayDate(dateDaysAgo(11)) },
  ];
}

export function buildInvestments(): Investment[] {
  return [
    { id: "INV-001", name: "Initial Inventory Stock", category: "Inventory", amount: 150000, date: displayDate(dateDaysAgo(40)) },
    { id: "INV-002", name: "Brand Launch Campaign", category: "Marketing", amount: 35000, date: displayDate(dateDaysAgo(30)) },
    { id: "INV-003", name: "Warehouse Setup", category: "Operations", amount: 48000, date: displayDate(dateDaysAgo(25)) },
    { id: "INV-004", name: "POS & Tools", category: "Technical", amount: 22000, date: displayDate(dateDaysAgo(18)) },
    { id: "INV-005", name: "Packaging Branding", category: "Brand", amount: 15000, date: displayDate(dateDaysAgo(12)) },
  ];
}

export function buildNotes(): Note[] {
  return [
    {
      id: "NOTE-1",
      title: "Restock school bags before Friday",
      body: "Pink and black variants sold out twice this week. Reorder from Atik.",
      createdAt: dateDaysAgo(1),
      pinned: true,
    },
    {
      id: "NOTE-2",
      title: "Courier delay — Pathao Mirpur",
      body: "Expect 1-day delay for Mirpur deliveries this weekend.",
      createdAt: dateDaysAgo(2),
      pinned: false,
    },
    {
      id: "NOTE-3",
      title: "Photo shoot assets",
      body: "New lifestyle shots ready for homepage hero rotation.",
      createdAt: dateDaysAgo(4),
      pinned: false,
    },
  ];
}

export function buildRoles(): Role[] {
  return [
    {
      id: "ROLE-1",
      name: "Owner",
      permissions: ["orders", "products", "finance", "purchases", "roles", "notes", "settings"],
      members: 1,
    },
    {
      id: "ROLE-2",
      name: "Operations",
      permissions: ["orders", "products", "purchases", "notes"],
      members: 2,
    },
    {
      id: "ROLE-3",
      name: "Finance",
      permissions: ["finance", "purchases", "notes"],
      members: 1,
    },
    {
      id: "ROLE-4",
      name: "Support",
      permissions: ["orders", "notes"],
      members: 3,
    },
  ];
}

export function createInitialState(): DashboardState {
  const products = buildAdminProducts();
  return {
    products,
    orders: buildOrders(),
    expenses: buildExpenses(),
    investments: buildInvestments(),
    purchases: buildPurchases(products),
    notes: buildNotes(),
    roles: buildRoles(),
  };
}
