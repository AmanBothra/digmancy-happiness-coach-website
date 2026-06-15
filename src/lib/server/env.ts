export function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

export function optionalEnv(name: string) {
  const value = process.env[name]?.trim();
  return value || undefined;
}

export function parseBoolean(value?: string) {
  return value === "true" || value === "1";
}
