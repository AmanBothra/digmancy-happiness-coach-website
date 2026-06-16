import nextEnv from "@next/env";
import path from "node:path";
import { fileURLToPath } from "node:url";

const { loadEnvConfig } = nextEnv;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

loadEnvConfig(process.cwd());

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  env: {
    WEBINAR_START_AT_ISO: process.env.WEBINAR_START_AT_ISO,
    WEBINAR_DISPLAY_DATE: process.env.WEBINAR_DISPLAY_DATE,
    WEBINAR_DISPLAY_TIME: process.env.WEBINAR_DISPLAY_TIME,
    WEBINAR_JOINING_LINK: process.env.WEBINAR_JOINING_LINK,
    REGISTRATION_AMOUNT: process.env.REGISTRATION_AMOUNT,
    REGISTRATION_COMPARE_AT_AMOUNT: process.env.REGISTRATION_COMPARE_AT_AMOUNT,
  },
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "src"),
    };

    return config;
  },
};

export default nextConfig;
