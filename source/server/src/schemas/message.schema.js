import { z } from "zod";
import {
  filePayloadSchema,
  objectIdSchema,
  optionalBase64String,
  optionalString,
  paginationQuerySchema,
} from "./common.schema.js";

export const userIdParamSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
});

export const getMessagesSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  query: paginationQuerySchema.optional(),
});

export const sendMessageSchema = z.object({
  params: z.object({
    id: objectIdSchema,
  }),
  body: z
    .object({
      text: optionalString(5000),
      image: optionalBase64String,
      file: filePayloadSchema,
    })
    .refine(
      (data) => Boolean(data.text || data.image || data.file),
      "Message must include text, image, or file"
    ),
});

