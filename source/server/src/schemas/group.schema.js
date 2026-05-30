import { z } from "zod";
import {
  filePayloadSchema,
  objectIdSchema,
  optionalBase64String,
  optionalString,
  paginationQuerySchema,
} from "./common.schema.js";

const optionalGroupName = z.preprocess(
  (value) => (value === null ? undefined : value),
  z.string().trim().min(1).max(80).optional()
);

export const groupIdParamSchema = z.object({
  params: z.object({
    groupId: objectIdSchema,
  }),
});

export const getGroupMessagesSchema = z.object({
  params: z.object({
    groupId: objectIdSchema,
  }),
  query: paginationQuerySchema.optional(),
});

export const memberParamSchema = z.object({
  params: z.object({
    groupId: objectIdSchema,
    memberId: objectIdSchema,
  }),
});

export const createGroupSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1).max(80),
    description: optionalString(500),
    memberIds: z.array(objectIdSchema).min(1).max(100),
    groupPic: optionalBase64String,
  }),
});

export const sendGroupMessageSchema = z.object({
  params: z.object({
    groupId: objectIdSchema,
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

export const addMembersSchema = z.object({
  params: z.object({
    groupId: objectIdSchema,
  }),
  body: z.object({
    memberIds: z.array(objectIdSchema).min(1).max(100),
  }),
});

export const updateGroupSchema = z.object({
  params: z.object({
    groupId: objectIdSchema,
  }),
  body: z
    .object({
      name: optionalGroupName,
      description: optionalString(500),
      groupPic: optionalBase64String,
    })
    .refine(
      (data) => Object.values(data).some((value) => value !== undefined),
      "At least one group field is required"
    ),
});
