import { backendProxy } from "@/lib/server/backend-proxy";
export async function POST(request: Request) {
  return backendProxy(request, "/entries");
}
