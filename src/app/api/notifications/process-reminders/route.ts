import { NextResponse } from "next/server";
import { processScheduledNotification } from "@/lib/server/notifications";
import { createRegistrationDatabase } from "@/lib/server/registration-db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const configuredSecret = process.env.CRON_SECRET;
  if (!configuredSecret && isProductionRuntime()) {
    return NextResponse.json(
      { ok: false, error: "cron_secret_not_configured" },
      { status: 500 },
    );
  }

  if (configuredSecret && !hasValidCronSecret(request, configuredSecret)) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const db = createRegistrationDatabase();
  const dueNotifications = await db.listDueScheduledNotifications(50);
  const results = [];

  for (const notification of dueNotifications) {
    results.push(await processScheduledNotification(db, notification));
  }

  return NextResponse.json({
    ok: true,
    processed: results.length,
    sent: results.filter((result) => result.sent).length,
    failed: results.filter((result) => result.error).length,
  });
}

function hasValidCronSecret(request: Request, configuredSecret: string) {
  const auth = request.headers.get("authorization");
  const directSecret = request.headers.get("x-cron-secret");
  return auth === `Bearer ${configuredSecret}` || directSecret === configuredSecret;
}

function isProductionRuntime() {
  return process.env.APP_ENV === "production" || process.env.NODE_ENV === "production";
}
