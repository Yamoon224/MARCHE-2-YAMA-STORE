import { NextResponse, type NextRequest } from "next/server";
import { BACKEND_URL, getToken } from "@/lib/server/backend";
import { buildUpstreamHeaders, isAllowedPath } from "@/lib/server/proxy";

async function relay(request: NextRequest, ctx: { params: Promise<{ path: string[] }> }): Promise<NextResponse> {
  const { path } = await ctx.params;

  if (!isAllowedPath(path)) {
    return NextResponse.json({ message: "Introuvable." }, { status: 404 });
  }

  const hasBody = !["GET", "HEAD"].includes(request.method);

  let upstream: Response;
  try {
    upstream = await fetch(`${BACKEND_URL}/${path.join("/")}${request.nextUrl.search}`, {
      method: request.method,
      headers: buildUpstreamHeaders(request.headers, await getToken()),
      body: hasBody ? await request.text() : undefined,
      cache: "no-store",
    });
  } catch {
    return NextResponse.json({ message: "Service momentanément indisponible." }, { status: 503 });
  }

  return new NextResponse(upstream.status === 204 ? null : await upstream.text(), {
    status: upstream.status,
    headers: { "Content-Type": upstream.headers.get("content-type") ?? "application/json" },
  });
}

export const GET = relay;
export const POST = relay;
export const PUT = relay;
export const PATCH = relay;
export const DELETE = relay;
