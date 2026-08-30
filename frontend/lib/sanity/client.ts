import { createClient, type SanityClient } from "next-sanity";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset   = process.env.NEXT_PUBLIC_SANITY_DATASET   ?? "production";
const apiVersion = process.env.NEXT_PUBLIC_SANITY_API_VERSION ?? "2024-01-01";

let _client: SanityClient | null = null;
let _writeClient: SanityClient | null = null;

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

export function getSanityWriteClient(): SanityClient | null {
  const token = process.env.SANITY_API_TOKEN;
  if (!projectId || !token || projectId === "your-project-id-here") return null;
  if (!_writeClient) {
    _writeClient = createClient({
      projectId,
      dataset,
      apiVersion,
      token,
      useCdn: false,
    });
  }
  return _writeClient;
}

export const sanityClient = {
  fetch: async <T>(query: string, params?: Record<string, unknown>): Promise<T | null> => {
    const client = getSanityClient();
    if (!client) return null;
    return client.fetch<T>(query, params);
  },
  create: async <T extends { _type: string; [key: string]: any }>(doc: T): Promise<any> => {
    const client = getSanityWriteClient();
    if (!client) return null;
    return client.create(doc);
  },
};
