import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  listDueScheduledNotifications: vi.fn(),
  processScheduledNotification: vi.fn(),
}));

vi.mock("@/lib/server/registration-db", () => ({
  createRegistrationDatabase: () => ({
    listDueScheduledNotifications: mocks.listDueScheduledNotifications,
  }),
}));

vi.mock("@/lib/server/notifications", () => ({
  processScheduledNotification: mocks.processScheduledNotification,
}));

import { POST } from "./route";

describe("POST /api/notifications/process-reminders", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.APP_ENV = "production";
    process.env.CRON_SECRET = "cron_test_secret";
  });

  afterEach(() => {
    delete process.env.APP_ENV;
    delete process.env.CRON_SECRET;
  });

  it("rejects production cron requests when the bearer token is missing", async () => {
    const response = await POST(
      new Request("https://authenticleadershipcircle.com/api/notifications/process-reminders", {
        method: "POST",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(401);
    expect(body).toEqual({ ok: false, error: "unauthorized" });
    expect(mocks.listDueScheduledNotifications).not.toHaveBeenCalled();
  });

  it("processes due scheduled notifications with a valid cron token", async () => {
    const dueNotifications = [
      { id: "sched_email_1", channel: "email" },
      { id: "sched_whatsapp_1", channel: "whatsapp" },
    ];
    mocks.listDueScheduledNotifications.mockResolvedValue(dueNotifications);
    mocks.processScheduledNotification
      .mockResolvedValueOnce({ sent: true })
      .mockResolvedValueOnce({ sent: false, error: "provider unavailable" });

    const response = await POST(
      new Request("https://authenticleadershipcircle.com/api/notifications/process-reminders", {
        method: "POST",
        headers: {
          authorization: "Bearer cron_test_secret",
        },
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ ok: true, processed: 2, sent: 1, failed: 1 });
    expect(mocks.listDueScheduledNotifications).toHaveBeenCalledWith(50);
    expect(mocks.processScheduledNotification).toHaveBeenCalledTimes(2);
  });

  it("requires CRON_SECRET in production", async () => {
    delete process.env.CRON_SECRET;

    const response = await POST(
      new Request("https://authenticleadershipcircle.com/api/notifications/process-reminders", {
        method: "POST",
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body).toEqual({ ok: false, error: "cron_secret_not_configured" });
    expect(mocks.listDueScheduledNotifications).not.toHaveBeenCalled();
  });
});
