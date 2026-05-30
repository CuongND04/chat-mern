import { createClient } from "redis";
import { env } from "../config/env.js";

let client;
let connectPromise;
let cacheDisabled = !env.REDIS_URL;

const getClient = async () => {
  if (cacheDisabled) return null;
  if (client?.isOpen) return client;
  if (connectPromise) return connectPromise;

  client = createClient({
    url: env.REDIS_URL,
    socket: {
      reconnectStrategy: false,
    },
  });
  client.on("error", (error) => {
    console.warn("Redis cache error:", error.message);
  });

  connectPromise = client
    .connect()
    .then(() => {
      console.log("Redis cache connected");
      return client;
    })
    .catch((error) => {
      cacheDisabled = true;
      console.warn("Redis cache disabled:", error.message);
      return null;
    })
    .finally(() => {
      connectPromise = null;
    });

  return connectPromise;
};

export const cacheKeys = {
  sidebarUsers: (userId) => `chat:users:${userId}:sidebar`,
  userGroups: (userId) => `chat:groups:${userId}:list`,
};

export const getCache = async (key) => {
  try {
    const redis = await getClient();
    if (!redis) return null;

    const cachedValue = await redis.get(key);
    if (!cachedValue) return null;

    return JSON.parse(cachedValue);
  } catch (error) {
    console.warn("Failed to read cache:", error.message);
    return null;
  }
};

export const setCache = async (key, value, ttlSeconds = env.CACHE_TTL_SECONDS) => {
  try {
    const redis = await getClient();
    if (!redis) return;

    await redis.set(key, JSON.stringify(value), {
      EX: ttlSeconds,
    });
  } catch (error) {
    console.warn("Failed to write cache:", error.message);
  }
};

export const deleteCache = async (...keys) => {
  try {
    const redis = await getClient();
    if (!redis) return;

    const validKeys = keys.filter(Boolean);
    if (validKeys.length > 0) {
      await redis.del(validKeys);
    }
  } catch (error) {
    console.warn("Failed to delete cache:", error.message);
  }
};

export const deleteCacheByPattern = async (pattern) => {
  try {
    const redis = await getClient();
    if (!redis) return;

    const keys = [];
    for await (const key of redis.scanIterator({ MATCH: pattern, COUNT: 100 })) {
      if (Array.isArray(key)) {
        keys.push(...key);
      } else {
        keys.push(key);
      }
    }

    if (keys.length > 0) {
      await redis.del(keys);
    }
  } catch (error) {
    console.warn("Failed to delete cache by pattern:", error.message);
  }
};

export const invalidateUserListCaches = () => deleteCacheByPattern("chat:users:*:sidebar");

const getIdString = (value) => {
  if (!value) return null;
  if (value._id) return value._id.toString();
  return value.toString();
};

export const invalidateGroupListCaches = (memberIds = []) =>
  deleteCache(
    ...memberIds
      .map(getIdString)
      .filter(Boolean)
      .map((memberId) => cacheKeys.userGroups(memberId))
  );
