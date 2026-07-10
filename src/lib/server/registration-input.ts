import { normalizeIndianMobile } from "./phone";

export type RegistrationInput = {
  name: string;
  email: string;
  mobile: string;
  city: string;
  profession: string;
};

export type RegistrationValidationResult =
  | { ok: true; value: RegistrationInput }
  | { ok: false; fields: Partial<Record<keyof RegistrationInput, string>> };

export function validateRegistrationInput(value: unknown): RegistrationValidationResult {
  if (!value || typeof value !== "object") {
    return {
      ok: false,
      fields: {
        name: "Name is required",
        email: "Email is required",
        mobile: "Mobile number is required",
        city: "City is required",
        profession: "Profession is required",
      },
    };
  }

  const record = value as Record<string, unknown>;
  const name = normalizeText(record.name);
  const email = normalizeText(record.email).toLowerCase();
  const mobile = normalizeIndianMobile(record.mobile);
  const city = normalizeText(record.city);
  const profession = normalizeText(record.profession);
  const fields: Partial<Record<keyof RegistrationInput, string>> = {};

  if (!name) {
    fields.name = "Name is required";
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fields.email = "Enter a valid email";
  }
  if (!mobile) {
    fields.mobile = "Enter a valid WhatsApp number";
  }
  if (!city) {
    fields.city = "City is required";
  }
  if (!profession) {
    fields.profession = "Profession is required";
  }

  if (Object.keys(fields).length) {
    return { ok: false, fields };
  }

  return { ok: true, value: { name, email, mobile, city, profession } };
}

function normalizeText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}
