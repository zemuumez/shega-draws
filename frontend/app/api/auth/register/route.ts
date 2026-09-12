import { backendProxy } from "@/lib/server/backend-proxy";
export const dynamic = "force-dynamic";
export async function POST(request: Request) {
  return backendProxy(request, "/auth/register");
}
