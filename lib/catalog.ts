import rawProducts from "@/data/products.json";

export const categories = [
  { slug: "school-bags", name: "School Bag", groups: ["bags", "kids"] },
  { slug: "womens-bags", name: "Woman's Bag", groups: ["bags"] },
  { slug: "backpacks", name: "Backpacks & Laptop Bags", groups: ["bags"] },
  { slug: "baby-blankets", name: "Baby Blanket", groups: ["kids"] },
  { slug: "bottles", name: "Bottle & Flask", groups: ["accessories"] },
  { slug: "kitchen", name: "Kitchen Essentials", groups: ["accessories"] },
  { slug: "home-cleaning", name: "Home & Cleaning", groups: ["accessories"] },
  { slug: "lamps-fans", name: "Lamps & Fans", groups: ["accessories"] },
  { slug: "personal-care", name: "Personal Care", groups: ["accessories"] },
] as const;

export type CategorySlug = (typeof categories)[number]["slug"];

export type CatalogProduct = {
  id: number;
  slug: string;
  name: string;
  baseName: string;
  variantLabel: string | null;
  colorHex: string | null;
  variantGroup: string | null;
  category: CategorySlug;
  price: number;
  oldPrice: number | null;
  images: string[];
  description: string[];
  code: string;
  rating: number;
  reviewCount: number;
};

export const catalog = rawProducts as CatalogProduct[];

const byId = new Map(catalog.map((p) => [p.id, p]));

export function getCatalogProduct(id: number) {
  return byId.get(id);
}

export function getCategoryName(slug: CategorySlug | string) {
  return categories.find((c) => c.slug === slug)?.name ?? slug;
}

export function distinctModels(list: CatalogProduct[]) {
  const seen = new Set<string>();
  const firsts: CatalogProduct[] = [];
  const rest: CatalogProduct[] = [];
  for (const p of list) {
    if (p.variantGroup && seen.has(p.variantGroup)) {
      rest.push(p);
    } else {
      if (p.variantGroup) seen.add(p.variantGroup);
      firsts.push(p);
    }
  }
  return [...firsts, ...rest];
}
