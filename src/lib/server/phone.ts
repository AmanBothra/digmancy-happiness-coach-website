export function normalizeIndianMobile(value: unknown) {
  let digits = typeof value === "string" || typeof value === "number"
    ? String(value).replace(/\D/g, "")
    : "";

  if (digits.startsWith("00")) {
    digits = digits.slice(2);
  }

  if (digits.startsWith("0") && digits.length === 11) {
    digits = digits.slice(1);
  }

  if (digits.length === 10) {
    return `91${digits}`;
  }

  if (digits.startsWith("91") && digits.length === 12) {
    return digits;
  }

  return "";
}
