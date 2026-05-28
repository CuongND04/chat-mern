import jwt from "jsonwebtoken";
import { env, isProduction } from "../config/env.js";

export const getJwtCookieOptions = () => ({
  maxAge: 7 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: "strict",
  secure: isProduction,
});

export const generateToken = (userId, res) => {
  if (!env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  const token = jwt.sign({ userId }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

  res.cookie(env.JWT_COOKIE_NAME, token, getJwtCookieOptions());
  return token;
};

export const clearTokenCookie = (res) => {
  res.cookie(env.JWT_COOKIE_NAME, "", {
    ...getJwtCookieOptions(),
    maxAge: 0,
  });
};

export const sanitizeUser = (user) => {
  const source = user?.toObject ? user.toObject() : user;
  if (!source) return null;

  const { password, __v, ...safeUser } = source;
  return safeUser;
};
