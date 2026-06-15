import { afterEach, describe, expect, it } from "vitest";
import { getRegistrationPrice, getRegistrationPriceLabel } from "./registration-price";

describe("registration price helpers", () => {
  afterEach(() => {
    delete process.env.REGISTRATION_AMOUNT;
    delete process.env.REGISTRATION_COMPARE_AT_AMOUNT;
  });

  it("uses the registration amount from the environment", () => {
    process.env.REGISTRATION_AMOUNT = "149";

    expect(getRegistrationPrice().amount).toBe(149);
    expect(getRegistrationPriceLabel()).toBe("₹149");
  });

  it("uses a configurable compare-at amount", () => {
    process.env.REGISTRATION_COMPARE_AT_AMOUNT = "1999";

    expect(getRegistrationPrice().compareAtAmount).toBe(1999);
  });
});
