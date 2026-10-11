export function moneyToCents(value: string | number) {
  const normalized = typeof value === "number" ? value.toFixed(2) : value;
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) {
    throw new Error("INVALID_MONEY");
  }
  const [whole, fraction = ""] = normalized.split(".");
  return Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
}

export function centsToMoney(value: number) {
  const absolute = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  return `${sign}${Math.trunc(absolute / 100)}.${String(absolute % 100).padStart(2, "0")}`;
}

export function calculateFinancialBalance(
  contracts: Array<{ amount: string; status: string }>,
  payments: Array<{ amount: string; status: string }>,
) {
  const agreed = contracts
    .filter((item) => item.status !== "cancelled")
    .reduce((total, item) => total + moneyToCents(item.amount), 0);
  const paid = payments
    .filter((item) => item.status === "paid")
    .reduce((total, item) => total + moneyToCents(item.amount), 0);
  return {
    agreed: centsToMoney(agreed),
    paid: centsToMoney(paid),
    balance: centsToMoney(agreed - paid),
  };
}
