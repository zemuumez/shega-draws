import { createClient, type SanityClient } from "next-sanity";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset   = process.env.NEXT_PUBLIC_SANITY_DATASET   ?? "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-01-01";

// Lazy singleton — returns null when Sanity isn't configured yet so pages
// degrade gracefully instead of throwing a 500 at startup.
let _client: SanityClient | null = null;

export function getSanityClient(): SanityClient | null {
  if (!projectId || projectId === "your-project-id-here") return null;
  if (!_client) {
    _client = createClient({
      projectId,
      dataset,
      apiVersion,
      useCdn: process.env.NODE_ENV === "production",
      perspective: "published",
    });
  }
  return _client;
}

// Named export for backwards compatibility — callers that already import
// `sanityClient` directly will get null when unconfigured.
export const sanityClient = {
  fetch: async <T>(query: string, params?: Record<string, unknown>): Promise<T | null> => {
    const client = getSanityClient();
    if (!client) return null;
    return client.fetch<T>(query, params);
  },
};

