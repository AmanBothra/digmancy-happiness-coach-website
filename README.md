# Authentic Leadership Circle Website

Next.js App Router site with a Node runtime for Cashfree payments, Supabase
storage, webhooks, and notification automation.

## Commands

```bash
npm install
npm run dev
npm run build
npm test
```

`npm run build` creates a server-rendered Next.js build in `.next/`.

## Environment

Copy `.env.example` to `.env.local` for local development. Production defaults
are hardcoded for this cPanel layout:

- Frontend: `https://authenticleadershipcircle.com`
- Backend/API: `https://authenticleadershipcircle.com/digmancy-backend`
- Supabase URL: `https://hhzpeldnktcqcvwyhdjw.supabase.co`
- SMTP host/sender: GoDaddy `connect@authenticleadershipcircle.com`
- WhatsApp endpoint/instance: current website provider endpoint

The env file should mostly contain secrets and business values:

- `WEBINAR_*`: date/time/joining-link values used on the site and in reminders.
- `REGISTRATION_AMOUNT` and `REGISTRATION_COMPARE_AT_AMOUNT`: payment price
  labels and Cashfree order amount.
- `SUPABASE_SECRET_KEY`: server-only Supabase database access.
- `CASHFREE_CLIENT_ID`, `CASHFREE_CLIENT_SECRET`, and `CASHFREE_PG_SECRET_KEY`:
  Cashfree order creation and webhook verification secrets.
- `SMTP_PASS`: email password.
- `WHATSAPP_API_KEY`: WhatsApp provider bearer token.
- `CRON_SECRET`: required in production for `/api/notifications/process-reminders`.
- `APP_BASE_URL_DEVELOPMENT`: optional ngrok URL for local Cashfree testing.

## Supabase Setup

Run the SQL in `supabase/migrations/20260612043354_create_seminar_registration.sql`
against the `Seminar Registration` Supabase project before using the payment
flow. The migration creates registrations, Cashfree payment events, notification
logs, and queued reminder tables with RLS enabled. The payment flow will return
`registration_storage_failed` until these tables exist in the hosted Supabase
project.

If the Supabase CLI or MCP is not connected, open the Supabase dashboard SQL
Editor for the project and run the migration SQL there.

## Cashfree Webhook

Configure Cashfree to send payment webhooks to:

```text
<APP_BASE_URL>/api/webhooks/cashfree/payments
```

The webhook route verifies `x-webhook-signature` against the raw request body
before recording payment status or sending notifications.

## Reminder Automation

Paid Cashfree webhooks queue reminder rows in Supabase. The cron job only sends
rows whose `scheduled_for` time is due, so it is safe to run every few minutes.

Call this route from cPanel cron every 5 minutes:

```bash
*/5 * * * * /usr/bin/curl -fsS -X POST "https://authenticleadershipcircle.com/api/notifications/process-reminders" -H "Authorization: Bearer <CRON_SECRET>" >/dev/null 2>&1
```

For `WEBINAR_START_AT_ISO=2026-06-28T05:30:00.000Z`, the app queues email and
WhatsApp reminders for:

- 2026-06-26 11:00 AM IST: two days before
- 2026-06-27 10:00 AM IST: one day before
- 2026-06-28 10:00 AM IST: one hour before

Manual test:

```bash
curl -i -X POST "https://authenticleadershipcircle.com/api/notifications/process-reminders" -H "Authorization: Bearer <CRON_SECRET>"
```

It sends due reminders through email and WhatsApp when Supabase tables and
provider credentials are configured.
