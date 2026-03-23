export const formatINR = (n: number): string =>
  "₹" + Math.round(n).toLocaleString("en-IN");

export const formatLakhs = (n: number): string => {
  if (n >= 10_000_000) return `₹${(n / 10_000_000).toFixed(1)}Cr`;
  if (n >= 100_000) return `₹${(n / 100_000).toFixed(1)}L`;
  return formatINR(n);
};

export const formatMonths = (months: number): string => {
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y === 0) return `${m} month${m !== 1 ? "s" : ""}`;
  if (m === 0) return `${y} yr${y > 1 ? "s" : ""}`;
  return `${y} yr${y > 1 ? "s" : ""} ${m} mo`;
};

export const formatDate = (d: Date | string): string =>
  new Date(d).toLocaleDateString("en-IN", { month: "short", year: "numeric" });

export const formatFinancialYear = (d: Date): string => {
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  return month >= 4
    ? `FY ${year}–${String(year + 1).slice(2)}`
    : `FY ${year - 1}–${String(year).slice(2)}`;
};
