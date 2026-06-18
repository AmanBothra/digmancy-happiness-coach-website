export function getApiBasePath() {
  const configured = process.env.NEXT_PUBLIC_API_BASE_PATH?.trim().replace(/\/$/, "");
  if (configured && configured !== "/") {
    return configured;
  }

  return "";
}
