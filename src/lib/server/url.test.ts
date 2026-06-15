import { afterEach, describe, expect, it } from "vitest";
import { getAppBaseUrl, getBackendBaseUrl, getFrontendBaseUrl } from "./url";

const ORIGINAL_ENV = process.env;

describe("getAppBaseUrl", () => {
  afterEach(() => {
    process.env = ORIGINAL_ENV;
  });

  it("uses the development base URL when APP_ENV is development", () => {
    process.env = {
      ...ORIGINAL_ENV,
      APP_ENV: "development",
      NODE_ENV: "production",
      APP_BASE_URL: "https://legacy-ngrok.example.test",
      APP_BASE_URL_DEVELOPMENT: "https://dev-ngrok.example.test/",
      APP_BASE_URL_PRODUCTION: "https://prod.example.test",
    };

    expect(getAppBaseUrl(new Request("http://localhost:3000/api/payments/cashfree/order"))).toBe(
      "https://dev-ngrok.example.test",
    );
  });

  it("uses the production website URL when APP_ENV is production", () => {
    process.env = {
      ...ORIGINAL_ENV,
      APP_ENV: "production",
      NODE_ENV: "development",
      APP_BASE_URL: "https://dev-ngrok.example.test",
      APP_BASE_URL_DEVELOPMENT: "https://dev-ngrok.example.test",
      APP_BASE_URL_PRODUCTION: "",
    };

    expect(getAppBaseUrl(new Request("http://localhost:3000/api/payments/cashfree/order"))).toBe(
      "https://authenticleadershipcircle.com",
    );
  });

  it("falls back to forwarded request headers when no env URL is configured", () => {
    process.env = {
      ...ORIGINAL_ENV,
      APP_ENV: "",
      NODE_ENV: "test",
      APP_BASE_URL: "",
      APP_BASE_URL_DEVELOPMENT: "",
      APP_BASE_URL_PRODUCTION: "",
    };

    const request = new Request("http://localhost:3000/api/payments/cashfree/order", {
      headers: {
        "x-forwarded-proto": "https",
        "x-forwarded-host": "preview.example.test",
      },
    });

    expect(getAppBaseUrl(request)).toBe("https://preview.example.test");
  });

  it("falls back to NODE_ENV when APP_ENV is not set", () => {
    process.env = {
      ...ORIGINAL_ENV,
      APP_ENV: "",
      NODE_ENV: "development",
      APP_BASE_URL: "https://legacy-ngrok.example.test",
      APP_BASE_URL_DEVELOPMENT: "https://node-env-dev.example.test",
      APP_BASE_URL_PRODUCTION: "https://prod.example.test",
    };

    expect(getAppBaseUrl(new Request("http://localhost:3000/api/payments/cashfree/order"))).toBe(
      "https://node-env-dev.example.test",
    );
  });

  it("supports split frontend and backend production URLs", () => {
    process.env = {
      ...ORIGINAL_ENV,
      APP_ENV: "production",
      NODE_ENV: "development",
      APP_FRONTEND_BASE_URL_PRODUCTION: "https://authenticleadershipcircle.com/",
      APP_BACKEND_BASE_URL_PRODUCTION: "https://authenticleadershipcircle.com/digmancy-backend/",
      APP_BASE_URL_PRODUCTION: "https://legacy.example.test",
    };

    const request = new Request(
      "https://authenticleadershipcircle.com/digmancy-backend/api/payments/cashfree/order",
    );

    expect(getFrontendBaseUrl(request)).toBe("https://authenticleadershipcircle.com");
    expect(getBackendBaseUrl(request)).toBe(
      "https://authenticleadershipcircle.com/digmancy-backend",
    );
  });
});
