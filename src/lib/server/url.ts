const PRODUCTION_BASE_URL = "https://authenticleadershipcircle.com";
const PRODUCTION_BACKEND_BASE_URL = "https://authenticleadershipcircle.com/digmancy-backend";

export function getAppBaseUrl(request: Request) {
  return getFrontendBaseUrl(request);
}

export function getFrontendBaseUrl(request: Request) {
  const configured = getConfiguredFrontendBaseUrl();
  if (configured) {
    return configured;
  }

  return getRequestBaseUrl(request);
}

export function getBackendBaseUrl(request: Request) {
  const configured = getConfiguredBackendBaseUrl();
  if (configured) {
    return configured;
  }

  return getRequestBaseUrl(request);
}

function getRequestBaseUrl(request: Request) {
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

function getConfiguredFrontendBaseUrl() {
  const runtimeEnv = getRuntimeEnv();

  if (runtimeEnv === "production") {
    return (
      normalizeUrl(process.env.APP_FRONTEND_BASE_URL_PRODUCTION) ||
      normalizeUrl(process.env.APP_BASE_URL_PRODUCTION) ||
      PRODUCTION_BASE_URL
    );
  }

  if (runtimeEnv === "development") {
    return (
      normalizeUrl(process.env.APP_FRONTEND_BASE_URL_DEVELOPMENT) ||
      normalizeUrl(process.env.APP_BASE_URL_DEVELOPMENT) ||
      normalizeUrl(process.env.APP_BASE_URL)
    );
  }

  return normalizeUrl(process.env.APP_FRONTEND_BASE_URL) || normalizeUrl(process.env.APP_BASE_URL);
}

function getConfiguredBackendBaseUrl() {
  const runtimeEnv = getRuntimeEnv();

  if (runtimeEnv === "production") {
    return normalizeUrl(process.env.APP_BACKEND_BASE_URL_PRODUCTION) || PRODUCTION_BACKEND_BASE_URL;
  }

  if (runtimeEnv === "development") {
    return normalizeUrl(process.env.APP_BACKEND_BASE_URL_DEVELOPMENT);
  }

  return normalizeUrl(process.env.APP_BACKEND_BASE_URL);
}

function getConfiguredAppBaseUrl() {
  const runtimeEnv = getRuntimeEnv();

  if (runtimeEnv === "production") {
    return normalizeUrl(process.env.APP_BASE_URL_PRODUCTION) || PRODUCTION_BASE_URL;
  }

  if (runtimeEnv === "development") {
    return normalizeUrl(process.env.APP_BASE_URL_DEVELOPMENT) || normalizeUrl(process.env.APP_BASE_URL);
  }

  return normalizeUrl(process.env.APP_BASE_URL);
}

function getRuntimeEnv() {
  return (
    process.env.APP_ENV?.trim() ||
    process.env.NEXT_PUBLIC_APP_ENV?.trim() ||
    process.env.NODE_ENV?.trim()
  );
}

function normalizeUrl(value?: string) {
  const normalized = value?.trim().replace(/\/$/, "");
  return normalized || undefined;
}
