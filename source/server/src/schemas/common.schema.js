import { z } from "zod";

export const objectIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid MongoDB ObjectId");

export const optionalString = (maxLength) =>
  z.preprocess(
    (value) => (value === null ? undefined : value),
    z.string().trim().max(maxLength).optional()
  );

export const optionalBase64String = z.preprocess(
  (value) => (value === null ? undefined : value),
  z.string().min(1).optional()
);

export const filePayloadSchema = z.preprocess(
  (value) => (value === null ? undefined : value),
  z
    .object({
      base64: z.string().min(1, "File data is required"),
      name: z.string().trim().min(1).max(255),
      size: z.number().int().positive().max(10 * 1024 * 1024),
      type: z.string().trim().min(1).max(120),
    })
    .optional()
);

