const BENGALI_DIGITS = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];

export function toBengaliDigits(value: number | string) {
  return String(value).replace(/\d/g, (d) => BENGALI_DIGITS[Number(d)]);
}

export function formatPrice(amount: number) {
  return `${toBengaliDigits(amount)}৳`;
}

export function formatTaka(amount: number) {
  return `৳${amount.toLocaleString("en-US")}`;
}

export function formatAmount(amount: number) {
  return amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function discountPercent(price: number, oldPrice: number | null) {
  if (!oldPrice || oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}
