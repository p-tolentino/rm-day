export function formatCurrency(amount: number) {
  if (isNaN(amount)) return "Invalid amount";

  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 2,
  }).format(amount);
}
