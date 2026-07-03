# Authentic Leadership Circle Website

Next.js App Router site with a Node runtime for Cashfree payments, Supabase
storage, webhooks, and notification automation.

## Commands

```bash
npm install
npm run dev
npm run build
npm start
npm test
```

`npm run build` creates a server-rendered Next.js build in `.next/`.
`npm start` runs the custom Node server in `server.mjs`. cPanel can also use
`app.js` as the application startup file.

## Environment

Copy `.env.example` to `.env.local` for local development. Production defaults
are hardcoded for this cPanel layout:

- Frontend: `https://authenticleadershipcircle.com`
- Backend/API: `https://authenticleadershipcircle.com`
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

For cPanel root-domain deployment, keep these values:

```env
APP_ENV=production
APP_FRONTEND_BASE_URL_PRODUCTION=https://authenticleadershipcircle.com
APP_BACKEND_BASE_URL_PRODUCTION=https://authenticleadershipcircle.com
NEXT_PUBLIC_API_BASE_PATH=
```

Only set `APP_BACKEND_BASE_URL_PRODUCTION` and `NEXT_PUBLIC_API_BASE_PATH` to a
subpath such as `/digmancy-backend` if the cPanel Node app is intentionally
mounted at that subpath.

## cPanel Deployment

In cPanel, create a Node.js app:

- Node.js version: 20 or 22
- Application mode: Production
- Application root: this repository folder
- Application URL: `/`
- Application startup file: `app.js`

Then install and build on the server:

```bash
npm ci --include=dev
npm run build
```

Restart the cPanel app from the panel, or run:

```bash
mkdir -p tmp
touch tmp/restart.txt
```

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

For the default cPanel root deployment, use:

```text
https://authenticleadershipcircle.com/api/webhooks/cashfree/payments
```

The webhook route verifies `x-webhook-signature` against the raw request body
before recording payment status or sending notifications.

## Reminder Automation

Paid Cashfree webhooks queue reminder rows in Supabase. The cron job only sends
rows whose `scheduled_for` time is due, so it is safe to run every few minutes.

Call this route from cPanel cron every 5 minutes. LiteSpeed should use
HTTP/1.1 or an explicit zero-length body for this POST route:

```bash
*/5 * * * * /bin/date -Is >> "$HOME/digmancy-cron.log"; /usr/bin/curl --http1.1 -fsS -X POST "https://authenticleadershipcircle.com/api/notifications/process-reminders" -H "Authorization: Bearer <CRON_SECRET>" -H "Content-Length: 0" >> "$HOME/digmancy-cron.log" 2>&1; /bin/echo >> "$HOME/digmancy-cron.log"
```

For `WEBINAR_START_AT_ISO=2026-06-28T05:30:00.000Z`, the app sends payment
confirmation immediately after payment, then queues email and WhatsApp reminders for:

- 2026-06-26 11:00 AM IST: two days before
- 2026-06-27 10:00 AM IST: one day before
- 2026-06-28 10:00 AM IST: one hour before
- 2026-06-28 10:45 AM IST: fifteen minutes before

Manual test:

```bash
curl --http1.1 -i -X POST "https://authenticleadershipcircle.com/api/notifications/process-reminders" -H "Authorization: Bearer <CRON_SECRET>" -H "Content-Length: 0"
```

It sends due reminders through email and WhatsApp when Supabase tables and
provider credentials are configured.
