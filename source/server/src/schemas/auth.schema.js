import { z } from "zod";
import { optionalBase64String, optionalString } from "./common.schema.js";

const optionalFullName = z.preprocess(
  (value) => (value === null ? undefined : value),
  z.string().trim().min(2).max(80).optional()
);

const optionalEmail = z.preprocess(
  (value) => (value === null ? undefined : value),
  z.string().trim().email().max(120).toLowerCase().optional()
);

export const signupSchema = z.object({
  body: z.object({
    fullName: z.string().trim().min(2).max(80),
    email: z.string().trim().email().max(120).toLowerCase(),
    password: z.string().min(6).max(128),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email().max(120).toLowerCase(),
    password: z.string().min(1).max(128),
  }),
});

export const updateProfileSchema = z.object({
  body: z
    .object({
      fullName: optionalFullName,
      email: optionalEmail,
      profilePic: optionalBase64String,
      bio: optionalString(300),
      location: optionalString(120),
    })
    .refine(
      (data) => Object.values(data).some((value) => value !== undefined && value !== ""),
      "At least one profile field is required"
    ),
});

export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1).max(128),
    newPassword: z.string().min(6).max(128),
  }),
});
