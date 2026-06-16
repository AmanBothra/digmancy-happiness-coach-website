# cPanel Node.js Deployment

This project is a server-rendered Next.js app with API routes for Cashfree,
Supabase, notifications, and webhooks. Deploy it with cPanel Node.js hosting,
not as static files in `public_html`.

## 1. Create the Node.js App

In cPanel, open:

```text
cPanel -> Software -> Setup Node.js App
```

Create the app with these settings:

```text
Node.js version: 20 or 22
Application mode: Production
Application root: digmancy-happiness-coach-website
Application URL: /
Application startup file: app.js
```

Choose `authenticleadershipcircle.com` as the domain if cPanel asks for one.

## 2. Pull the Code

Open cPanel Terminal or SSH.

For a fresh setup:

```bash
cd ~
git clone -b cpannel https://github.com/AmanBothra/digmancy-happiness-coach-website.git
cd digmancy-happiness-coach-website
```

For an existing setup:

```bash
cd ~/digmancy-happiness-coach-website
git fetch
git checkout cpannel
git pull
```

## 3. Environment Variables

Add these in the cPanel Node.js app environment variables section:

```env
APP_ENV=production
APP_FRONTEND_BASE_URL_PRODUCTION=https://authenticleadershipcircle.com
APP_BACKEND_BASE_URL_PRODUCTION=https://authenticleadershipcircle.com
NEXT_PUBLIC_API_BASE_PATH=
```

Add the required business values and secrets:

```env
WEBINAR_START_AT_ISO=2026-06-28T05:30:00.000Z
WEBINAR_DISPLAY_DATE=Sunday 28 June
WEBINAR_DISPLAY_TIME=11:00 AM IST
WEBINAR_JOINING_LINK=

REGISTRATION_AMOUNT=99
REGISTRATION_COMPARE_AT_AMOUNT=999

SUPABASE_SECRET_KEY=

CASHFREE_CLIENT_ID=
CASHFREE_CLIENT_SECRET=
CASHFREE_PG_SECRET_KEY=

SMTP_PASS=
WHATSAPP_API_KEY=
CRON_SECRET=
```

Do not commit real secret values to GitHub.

## 4. Install and Build

Run this in cPanel Terminal:

```bash
cd ~/digmancy-happiness-coach-website
npm ci --include=dev
npm run build
```

## 5. Start or Restart

Restart from the cPanel Node.js app screen, or run:

```bash
mkdir -p tmp
touch tmp/restart.txt
```

The app starts through:

```text
app.js -> server.mjs
```

The server listens on `process.env.PORT`, which cPanel provides automatically.

## 6. Cashfree Webhook

Set this webhook URL in Cashfree:

```text
https://authenticleadershipcircle.com/api/webhooks/cashfree/payments
```

## 7. Reminder Cron Job

In cPanel, open:

```text
cPanel -> Cron Jobs
```

Add this cron command:

```bash
*/5 * * * * /usr/bin/curl -fsS -X POST "https://authenticleadershipcircle.com/api/notifications/process-reminders" -H "Authorization: Bearer YOUR_CRON_SECRET" >/dev/null 2>&1
```

Replace `YOUR_CRON_SECRET` with the same value used in the Node.js environment
variable `CRON_SECRET`.

## 8. Future Updates

After pushing new code to the `cpannel` branch:

```bash
cd ~/digmancy-happiness-coach-website
git pull
npm ci --include=dev
npm run build
mkdir -p tmp
touch tmp/restart.txt
```

## Common Checks

If the website opens but payment or API calls fail, check:

- The cPanel app URL is `/`.
- The startup file is `app.js`.
- The app is running in Production mode.
- Environment variables are present in the cPanel Node.js app.
- `npm run build` was run after setting environment variables.
- Supabase migration SQL has been applied.
- Cashfree webhook URL uses `/api/webhooks/cashfree/payments`.
- `CRON_SECRET` in the cron command matches the environment variable.
