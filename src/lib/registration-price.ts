const DEFAULT_REGISTRATION_AMOUNT = 99;
const DEFAULT_COMPARE_AT_AMOUNT = 999;

export type RegistrationPrice = {
  amount: number;
  compareAtAmount: number;
};

export function getRegistrationPrice(): RegistrationPrice {
  return {
    amount: parsePositiveAmount(process.env.REGISTRATION_AMOUNT, DEFAULT_REGISTRATION_AMOUNT),
    compareAtAmount: parsePositiveAmount(
      process.env.REGISTRATION_COMPARE_AT_AMOUNT,
      DEFAULT_COMPARE_AT_AMOUNT,
    ),
  };
}

export function getRegistrationPriceLabel(amount = getRegistrationPrice().amount) {
  return formatRupeeAmount(amount);
}

export function getRegistrationCompareAtPriceLabel(
  amount = getRegistrationPrice().compareAtAmount,
) {
  return formatRupeeAmount(amount);
}

function parsePositiveAmount(value: string | undefined, fallback: number) {
  if (!value) {
    return fallback;
  }

  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Registration price must be a positive number");
  }

  return amount;
}

function formatRupeeAmount(amount: number) {
  return `₹${new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 2,
  }).format(amount)}`;
}
