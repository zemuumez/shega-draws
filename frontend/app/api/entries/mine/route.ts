import { backendProxy } from "@/lib/server/backend-proxy";
export const dynamic = "force-dynamic";
export async function GET(request: Request) {
  const params = new URLSearchParams();
  const drawId = new URL(request.url).searchParams.get("draw_id");
  if (drawId) params.set("draw_id", drawId);
  return backendProxy(request, `/entries/mine?${params}`);
}
