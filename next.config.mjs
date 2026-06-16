import nextEnv from "@next/env";

const { loadEnvConfig } = nextEnv;
loadEnvConfig(process.cwd());

const nextConfig = {
  env: {
    WEBINAR_START_AT_ISO: process.env.WEBINAR_START_AT_ISO,
    WEBINAR_DISPLAY_DATE: process.env.WEBINAR_DISPLAY_DATE,
    WEBINAR_DISPLAY_TIME: process.env.WEBINAR_DISPLAY_TIME,
    WEBINAR_JOINING_LINK: process.env.WEBINAR_JOINING_LINK,
    REGISTRATION_AMOUNT: process.env.REGISTRATION_AMOUNT,
    REGISTRATION_COMPARE_AT_AMOUNT: process.env.REGISTRATION_COMPARE_AT_AMOUNT,
  },
};

export default nextConfig;
