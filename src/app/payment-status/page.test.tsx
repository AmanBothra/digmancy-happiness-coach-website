import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import PaymentStatusPage from "./page";

describe("PaymentStatusPage", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows the thank-you message only after the backend confirms the order is paid", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            ok: true,
            orderId: "alc_test_1",
            status: "paid",
            paymentStatus: "SUCCESS",
          }),
          { status: 200 },
        ),
      ),
    );
    window.history.pushState({}, "", "/payment-status?order_id=alc_test_1");

    render(<PaymentStatusPage />);

    expect(screen.getByText("Confirming your payment...")).toBeInTheDocument();
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
    expect(fetch).toHaveBeenCalledWith(
      "/api/payments/cashfree/status?order_id=alc_test_1",
      expect.objectContaining({ cache: "no-store" }),
    );
  });

  it("does not show success while the backend order is still pending", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(
          JSON.stringify({
            ok: true,
            orderId: "alc_test_1",
            status: "pending_payment",
            paymentStatus: null,
          }),
          { status: 200 },
        ),
      ),
    );
    window.history.pushState({}, "", "/payment-status?order_id=alc_test_1");

    render(<PaymentStatusPage />);

    await waitFor(() => {
      expect(
        screen.getByRole("heading", {
          name: "Payment is being verified",
        }),
      ).toBeInTheDocument();
    });
    expect(
      screen.queryByRole("heading", {
        name: "Thank you for registering for the masterclass.",
      }),
    ).not.toBeInTheDocument();
  });
});
