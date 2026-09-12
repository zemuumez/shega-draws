import { backendProxy } from "@/lib/server/backend-proxy";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  return backendProxy(request, "/draws/active");
}
