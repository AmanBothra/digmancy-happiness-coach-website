# Authentic Leadership Circle Website

Next.js App Router site with a Cashfree Payment Form webhook backend.

## Commands

```bash
npm install
npm run dev
npm run build
npm start
npm test
```

## Environment

Copy `.env.example` to `.env.local` for local development and configure the
same variables in cPanel Node hosting for production.

- `NEXT_PUBLIC_REGISTRATION_URL`: Cashfree Payment Form URL used by all CTAs.
- `DATABASE_PATH`: writable SQLite path, for example `./data/app.sqlite`.
- `CASHFREE_PG_SECRET_KEY`: Cashfree Payment Gateway secret key used to verify webhooks.
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`: SMTP connection settings.
- `SMTP_FROM_EMAIL`, `SMTP_FROM_NAME`: sender identity for customer confirmation email.

## Cashfree Webhook

Configure this production webhook URL in Cashfree:

```text
https://<domain>/api/webhooks/cashfree/payment-form
```

Subscribe it to the Payment Form order webhook event. The endpoint verifies
`x-webhook-signature` and `x-webhook-timestamp` against the raw request body,
stores the payment form order in SQLite, and sends one customer confirmation
email for paid orders.

## cPanel Node Notes

Use server-mode Next.js, not static export. Keep `DATABASE_PATH` pointed at a
durable writable directory that is not deleted during deployments. The build is
configured with `output: "standalone"` so it can be deployed as a Node app.
