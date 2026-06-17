import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import PaymentStatusPage from "./page";

describe("PaymentStatusPage", () => {
  it("shows the thank-you message when Cashfree returns with an order id", async () => {
    window.history.pushState({}, "", "/payment-status?order_id=alc_test_1");

    render(<PaymentStatusPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", {
          name: "Thank you for registering for the masterclass.",
        }),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByText("Check your registered WhatsApp number and Email for further details."),
    ).toBeInTheDocument();
  });
});
