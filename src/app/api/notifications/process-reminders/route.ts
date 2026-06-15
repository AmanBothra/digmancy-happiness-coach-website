import { NextResponse } from "next/server";
import { processScheduledNotification } from "@/lib/server/notifications";
import { createRegistrationDatabase } from "@/lib/server/registration-db";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const configuredSecret = process.env.CRON_SECRET;
  if (configuredSecret) {
    const auth = request.headers.get("authorization");
    const directSecret = request.headers.get("x-cron-secret");
    if (auth !== `Bearer ${configuredSecret}` && directSecret !== configuredSecret) {
      return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
    }
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
