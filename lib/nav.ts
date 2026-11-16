export const navItems = [
  { label: "Dashboard", href: "/", icon: "/icons/nav-dashboard.svg" },
  { label: "Orders", href: "/orders", icon: "/icons/nav-orders.svg" },
  { label: "Products", href: "/products", icon: "/icons/nav-products.svg" },
  { label: "Finance", href: "/finance", icon: "/icons/nav-finance.svg" },
  { label: "Purchases", href: "/purchases", icon: "/icons/nav-purchases.svg" },
  { label: "Roles & Permission", href: "/roles", icon: "/icons/nav-roles.svg" },
  { label: "Notes", href: "/notes", icon: "/icons/nav-notes.svg" },
] as const;

export type NavHref = (typeof navItems)[number]["href"];

export const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/orders": "Orders",
  "/products": "Product Management",
  "/finance": "Finance",
  "/purchases": "Purchases",
  "/roles": "Roles & Permission",
  "/notes": "Notes",
};
