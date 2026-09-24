import { createClient, type SanityClient } from "next-sanity";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset   = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION || "2024-01-01";

let _client: SanityClient | null = null;

export function getSanityClient(): SanityClient | null {
  if (!projectId || projectId === "your-project-id-here") {
    if (typeof window !== "undefined") {
      console.warn("⚠️ [Sanity] NEXT_PUBLIC_SANITY_PROJECT_ID is not configured in your environment.");
    }
    return null;
  }
  if (!_client) {
    _client = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: false,
      perspective: "published",
    });
  }
  return _client;
}

export const sanityClient = {
  fetch: async <T>(query: string, params?: Record<string, unknown>): Promise<T | null> => {
    const client = getSanityClient();
    if (!client) return null;
    return client.fetch<T>(query, params || {}, {
      cache: "no-store",
    });
  },
};
