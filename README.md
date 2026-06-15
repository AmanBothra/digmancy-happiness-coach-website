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

Copy `.env.example` to `.env.local` for local development.

- `SUPABASE_URL` and `SUPABASE_SECRET_KEY`: server-only Supabase database access.
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: public
  Supabase project metadata if a future browser client needs it.
- `REGISTRATION_AMOUNT`: registration price used for Cashfree order creation.
  Defaults to `99`.
- `CASHFREE_CLIENT_ID` and `CASHFREE_CLIENT_SECRET`: Cashfree PG credentials for
  creating orders. `CASHFREE_PG_SECRET_KEY` is still supported for webhook
  signature verification/backward compatibility.
- `CASHFREE_API_VERSION`: Cashfree PG API version header. Defaults to
  `2025-01-01`.
- `APP_ENV`: set to `development` or `production` to choose which public base
  URL is sent to Cashfree.
- `APP_BASE_URL_DEVELOPMENT`: public ngrok URL used for Cashfree return and
  webhook URLs when `APP_ENV=development`.
- `APP_BASE_URL_PRODUCTION`: production site URL used when `APP_ENV=production`.
  Defaults to `https://authenticleadershipcircle.com`.
- `APP_BASE_URL`: fallback when `APP_ENV` is not `development` or `production`.
- `SMTP_*`: email sender settings.
- `WHATSAPP_API_URL`, `WHATSAPP_API_KEY`, and `WHATSAPP_INSTANCE_ID`: WhatsApp
  provider endpoint, JWT bearer token, and instance id. The sender posts
  `{ "to": "...", "message": "..." }` with `Authorization: Bearer <token>`.
- `WEBINAR_*`: date/time/joining-link values used in reminder messages.
- `CRON_SECRET`: optional bearer token for `/api/notifications/process-reminders`.

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

Call this route from a cron job every few minutes:

```text
POST <APP_BASE_URL>/api/notifications/process-reminders
Authorization: Bearer <CRON_SECRET>
```

It sends due Friday/Saturday/Sunday reminders through email and WhatsApp when
the provider credentials are configured.
