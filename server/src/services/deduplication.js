import { Redis } from '@upstash/redis';

// Initialize Redis client. This expects UPSTASH_REDIS_URL and UPSTASH_REDIS_TOKEN in .env
let redis = null;

try {
  if (process.env.UPSTASH_REDIS_URL && process.env.UPSTASH_REDIS_TOKEN) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_URL,
      token: process.env.UPSTASH_REDIS_TOKEN,
    });
  } else {
    console.warn("Upstash Redis credentials not found in .env. Deduplication is disabled.");
  }
} catch (e) {
  console.warn("Could not initialize Upstash Redis:", e.message);
}

/**
 * Checks if the given unique ID has been processed recently.
 * @param {string} id - The unique identifier for the event (e.g., webhook delivery ID)
 * @returns {Promise<boolean>} true if it's a duplicate, false if it's new (and it is now saved).
 */
export const isDuplicateEvent = async (id) => {
  if (!redis) return false; // If Redis isn't configured, bypass deduplication

  try {
    // SET NX EX 86400 -> Set only if Not eXists, EXpire in 86400 seconds (24h)
    const result = await redis.set(`webhook_event:${id}`, "processed", {
      nx: true,
      ex: 86400,
    });

    if (result) {
      return false; // Key was set successfully -> NOT a duplicate
    }
    
    return true; // Key already existed -> IS a duplicate
  } catch (error) {
    console.error("Error during Redis deduplication check:", error.message);
    return false; // Default to false if Redis fails, so we don't drop events
  }
};
