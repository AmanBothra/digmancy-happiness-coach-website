const PRODUCTION_BASE_URL = "https://authenticleadershipcircle.com";

export function getAppBaseUrl(request: Request) {
  const configured = getConfiguredAppBaseUrl();
  if (configured) {
    return configured;
  }

  const forwardedProto = request.headers.get("x-forwarded-proto");
  const forwardedHost = request.headers.get("x-forwarded-host");
  if (forwardedProto && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }

  const origin = request.headers.get("origin");
  if (origin) {
    return origin;
  }

  return new URL(request.url).origin;
}

function getConfiguredAppBaseUrl() {
  const runtimeEnv =
    process.env.APP_ENV?.trim() ||
    process.env.NEXT_PUBLIC_APP_ENV?.trim() ||
    process.env.NODE_ENV?.trim();

  if (runtimeEnv === "production") {
    return normalizeUrl(process.env.APP_BASE_URL_PRODUCTION) || PRODUCTION_BASE_URL;
  }

  if (runtimeEnv === "development") {
    return normalizeUrl(process.env.APP_BASE_URL_DEVELOPMENT) || normalizeUrl(process.env.APP_BASE_URL);
  }

  return normalizeUrl(process.env.APP_BASE_URL);
}

function normalizeUrl(value?: string) {
  const normalized = value?.trim().replace(/\/$/, "");
  return normalized || undefined;
}
