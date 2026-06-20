import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it } from "vitest";
import { PriceCtaContent } from "./PriceCtaContent";

describe("PriceCtaContent", () => {
  it("keeps the label, price, and arrow on one line", () => {
    render(
      <PriceCtaContent
        label="Reserve Your Spot"
        compareAtPrice="₹999"
        registrationPrice="₹1"
      />,
    );

    const label = screen.getByText("Reserve Your Spot");
    const price = screen.getByText("₹1 Only");
    const content = label.closest("[data-price-cta-content]");
    const priceGroup = price.closest("[data-price-cta-price]");

    expect(label).toHaveClass("whitespace-nowrap");
    expect(priceGroup).toHaveClass("whitespace-nowrap");
    expect(content).toHaveClass("flex-row", "whitespace-nowrap");
    expect(content).not.toHaveClass("flex-col");
    expect(priceGroup?.querySelector("[data-price-cta-arrow]")).not.toBeNull();
  });
});
