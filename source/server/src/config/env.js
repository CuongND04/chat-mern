import dotenv from "dotenv";

dotenv.config();

const parseOrigins = (value) =>
  value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const toNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const env = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: process.env.PORT || 5001,
  CLIENT_URLS: parseOrigins(process.env.CLIENT_URL || "http://localhost:5173"),
  JSON_BODY_LIMIT: process.env.JSON_BODY_LIMIT || "50mb",
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || "7d",
  JWT_COOKIE_NAME: process.env.JWT_COOKIE_NAME || "jwt",
  RATE_LIMIT_WINDOW_MS: toNumber(process.env.RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
  RATE_LIMIT_MAX: toNumber(process.env.RATE_LIMIT_MAX, 300),
  AUTH_RATE_LIMIT_MAX: toNumber(process.env.AUTH_RATE_LIMIT_MAX, 20),
  REDIS_URL: process.env.REDIS_URL || "",
  CACHE_TTL_SECONDS: toNumber(process.env.CACHE_TTL_SECONDS, 60),
  MESSAGE_PAGE_LIMIT: toNumber(process.env.MESSAGE_PAGE_LIMIT, 50),
  MESSAGE_PAGE_MAX_LIMIT: toNumber(process.env.MESSAGE_PAGE_MAX_LIMIT, 100),
};

export const isProduction = env.NODE_ENV === "production";

