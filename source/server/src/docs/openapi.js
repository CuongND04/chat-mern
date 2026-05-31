import { env } from "../config/env.js";

const errorResponse = {
  type: "object",
  properties: {
    success: { type: "boolean", example: false },
    message: { type: "string", example: "Validation failed" },
    errors: {
      type: "array",
      items: {
        type: "object",
        properties: {
          path: { type: "string", example: "body.email" },
          message: { type: "string", example: "Invalid email address" },
        },
      },
    },
  },
};

const objectId = {
  type: "string",
  pattern: "^[0-9a-fA-F]{24}$",
  example: "507f1f77bcf86cd799439011",
};

const filePayload = {
  type: "object",
  properties: {
    base64: { type: "string", description: "Base64 encoded file data" },
    name: { type: "string", example: "document.pdf" },
    size: { type: "integer", example: 102400 },
    type: { type: "string", example: "application/pdf" },
  },
};

const messageBody = {
  type: "object",
  properties: {
    text: { type: "string", example: "Hello" },
    image: { type: "string", description: "Base64 encoded image" },
    file: filePayload,
  },
};

export const openApiSpec = {
  openapi: "3.0.3",
  info: {
    title: "HiChat Realtime Chat API",
    version: "1.0.0",
    description:
      "REST API documentation for authentication, direct messages, group chat, file uploads, and read receipts.",
  },
  servers: [
    {
      url: `http://localhost:${env.PORT}/api`,
      description: "Local development server",
    },
  ],
  tags: [
    { name: "Auth", description: "Authentication and profile APIs" },
    { name: "Messages", description: "Direct chat APIs" },
    { name: "Groups", description: "Group chat APIs" },
  ],
  components: {
    securitySchemes: {
      cookieAuth: {
        type: "apiKey",
        in: "cookie",
        name: env.JWT_COOKIE_NAME,
      },
    },
    schemas: {
      Error: errorResponse,
      User: {
        type: "object",
        properties: {
          _id: objectId,
          fullName: { type: "string", example: "Nguyen Duc Cuong" },
          email: { type: "string", example: "cuong@example.com" },
          profilePic: { type: "string", example: "https://res.cloudinary.com/demo/image.jpg" },
          unreadCount: { type: "integer", example: 2 },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Message: {
        type: "object",
        properties: {
          _id: objectId,
          senderId: objectId,
          receiverId: objectId,
          groupId: objectId,
          text: { type: "string", example: "Hello" },
          image: { type: "string", example: "https://res.cloudinary.com/demo/image.jpg" },
          file: {
            type: "object",
            properties: {
              url: { type: "string" },
              name: { type: "string" },
              size: { type: "integer" },
              type: { type: "string" },
            },
          },
          read: { type: "boolean", example: false },
          readBy: {
            type: "array",
            items: objectId,
          },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      Group: {
        type: "object",
        properties: {
          _id: objectId,
          name: { type: "string", example: "Project Team" },
          description: { type: "string", example: "Realtime chat group" },
          groupPic: { type: "string" },
          admin: { $ref: "#/components/schemas/User" },
          members: {
            type: "array",
            items: { $ref: "#/components/schemas/User" },
          },
          lastMessage: { $ref: "#/components/schemas/Message" },
          unreadCount: { type: "integer", example: 3 },
        },
      },
    },
    responses: {
      Unauthorized: {
        description: "Authentication required or invalid token",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
      ValidationError: {
        description: "Invalid request body, params, or query",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/Error" },
          },
        },
      },
    },
  },
  paths: {
    "/auth/signup": {
      post: {
        tags: ["Auth"],
        summary: "Create a new account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["fullName", "email", "password"],
                properties: {
                  fullName: { type: "string", example: "Nguyen Duc Cuong" },
                  email: { type: "string", example: "cuong@example.com" },
                  password: { type: "string", minLength: 6, example: "123456" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Account created",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/User" } },
            },
          },
          400: { $ref: "#/components/responses/ValidationError" },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login and set JWT cookie",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["email", "password"],
                properties: {
                  email: { type: "string", example: "cuong@example.com" },
                  password: { type: "string", example: "123456" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Logged in",
            headers: {
              "Set-Cookie": {
                schema: { type: "string" },
                description: "JWT httpOnly cookie",
              },
            },
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/User" } },
            },
          },
          400: { $ref: "#/components/responses/ValidationError" },
          429: {
            description: "Too many authentication attempts",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Error" } },
            },
          },
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout and clear JWT cookie",
        security: [{ cookieAuth: [] }],
        responses: {
          200: { description: "Logged out" },
        },
      },
    },
    "/auth/check": {
      get: {
        tags: ["Auth"],
        summary: "Get current authenticated user",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "Current user",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/User" } },
            },
          },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/auth/update-profile": {
      put: {
        tags: ["Auth"],
        summary: "Update current user profile",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  fullName: { type: "string" },
                  email: { type: "string" },
                  profilePic: { type: "string", description: "Base64 encoded image" },
                  bio: { type: "string" },
                  location: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Updated user",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/User" } },
            },
          },
          400: { $ref: "#/components/responses/ValidationError" },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/auth/change-password": {
      put: {
        tags: ["Auth"],
        summary: "Change current user password",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["currentPassword", "newPassword"],
                properties: {
                  currentPassword: { type: "string" },
                  newPassword: { type: "string", minLength: 6 },
                },
              },
            },
          },
        },
        responses: {
          200: { description: "Password changed" },
          400: { $ref: "#/components/responses/ValidationError" },
          401: { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/messages/users": {
      get: {
        tags: ["Messages"],
        summary: "Get users for sidebar with unread counts",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "Users",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/User" },
                },
              },
            },
          },
        },
      },
    },
    "/messages/{id}": {
      get: {
        tags: ["Messages"],
        summary: "Get direct message history",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "id", in: "path", required: true, schema: objectId },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100 } },
          { name: "before", in: "query", schema: { type: "string", format: "date-time" } },
        ],
        responses: {
          200: {
            description: "Messages",
            headers: {
              "X-Next-Cursor": {
                schema: { type: "string", format: "date-time" },
                description: "Cursor for loading older messages",
              },
            },
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Message" },
                },
              },
            },
          },
        },
      },
    },
    "/messages/send/{id}": {
      post: {
        tags: ["Messages"],
        summary: "Send a direct message",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: objectId }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: messageBody },
          },
        },
        responses: {
          201: {
            description: "Created message",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Message" } },
            },
          },
          400: { $ref: "#/components/responses/ValidationError" },
        },
      },
    },
    "/messages/read/{id}": {
      put: {
        tags: ["Messages"],
        summary: "Mark direct messages from a user as read",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "id", in: "path", required: true, schema: objectId }],
        responses: {
          200: { description: "Messages marked as read" },
        },
      },
    },
    "/groups": {
      get: {
        tags: ["Groups"],
        summary: "Get current user's groups",
        security: [{ cookieAuth: [] }],
        responses: {
          200: {
            description: "Groups",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Group" },
                },
              },
            },
          },
        },
      },
    },
    "/groups/create": {
      post: {
        tags: ["Groups"],
        summary: "Create a group",
        security: [{ cookieAuth: [] }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["name", "memberIds"],
                properties: {
                  name: { type: "string", example: "Project Team" },
                  description: { type: "string" },
                  memberIds: { type: "array", items: objectId },
                  groupPic: { type: "string", description: "Base64 encoded image" },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: "Created group",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Group" } },
            },
          },
        },
      },
    },
    "/groups/{groupId}/messages": {
      get: {
        tags: ["Groups"],
        summary: "Get group message history",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "groupId", in: "path", required: true, schema: objectId },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 100 } },
          { name: "before", in: "query", schema: { type: "string", format: "date-time" } },
        ],
        responses: {
          200: {
            description: "Group messages",
            headers: {
              "X-Next-Cursor": {
                schema: { type: "string", format: "date-time" },
                description: "Cursor for loading older messages",
              },
            },
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { $ref: "#/components/schemas/Message" },
                },
              },
            },
          },
        },
      },
    },
    "/groups/{groupId}/send": {
      post: {
        tags: ["Groups"],
        summary: "Send a group message",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "groupId", in: "path", required: true, schema: objectId }],
        requestBody: {
          required: true,
          content: {
            "application/json": { schema: messageBody },
          },
        },
        responses: {
          201: {
            description: "Created message",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Message" } },
            },
          },
        },
      },
    },
    "/groups/{groupId}/read": {
      put: {
        tags: ["Groups"],
        summary: "Mark group messages as read",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "groupId", in: "path", required: true, schema: objectId }],
        responses: { 200: { description: "Messages marked as read" } },
      },
    },
    "/groups/{groupId}/members": {
      post: {
        tags: ["Groups"],
        summary: "Add members to a group",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "groupId", in: "path", required: true, schema: objectId }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["memberIds"],
                properties: { memberIds: { type: "array", items: objectId } },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Updated group",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Group" } },
            },
          },
        },
      },
    },
    "/groups/{groupId}/members/{memberId}": {
      delete: {
        tags: ["Groups"],
        summary: "Remove a member from a group",
        security: [{ cookieAuth: [] }],
        parameters: [
          { name: "groupId", in: "path", required: true, schema: objectId },
          { name: "memberId", in: "path", required: true, schema: objectId },
        ],
        responses: {
          200: {
            description: "Updated group",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Group" } },
            },
          },
        },
      },
    },
    "/groups/{groupId}": {
      put: {
        tags: ["Groups"],
        summary: "Update group info",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "groupId", in: "path", required: true, schema: objectId }],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  description: { type: "string" },
                  groupPic: { type: "string", description: "Base64 encoded image" },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: "Updated group",
            content: {
              "application/json": { schema: { $ref: "#/components/schemas/Group" } },
            },
          },
        },
      },
    },
    "/groups/{groupId}/leave": {
      post: {
        tags: ["Groups"],
        summary: "Leave a group",
        security: [{ cookieAuth: [] }],
        parameters: [{ name: "groupId", in: "path", required: true, schema: objectId }],
        responses: { 200: { description: "Left group successfully" } },
      },
    },
  },
};

