# Authentic Leadership Circle Website

Next.js App Router site configured for static export.

## Commands

```bash
npm install
npm run dev
npm run build
npm test
```

`npm run build` writes the static site to `dist/`.

## Environment

Copy `.env.example` to `.env.local` for local development.

- `NEXT_PUBLIC_REGISTRATION_URL`: Cashfree Payment Form URL used by all CTAs.

## Cashfree Webhook

Static export does not expose Next.js API routes. The previous webhook handler
code is kept under `src/server/` for reference/tests, but it is not deployed as
part of the static `dist/` output.

## Static Hosting Notes

Upload the generated `dist/` folder to static hosting.
