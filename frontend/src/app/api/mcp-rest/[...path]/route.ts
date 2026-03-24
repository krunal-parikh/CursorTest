import { NextRequest, NextResponse } from "next/server";

const MCP_REST_URL = process.env.MCP_REST_URL || "http://localhost:3000";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path.join("/");
  const url = new URL(req.url);
  const search = url.searchParams.toString();
  const target = `${MCP_REST_URL}/${pathStr}${search ? `?${search}` : ""}`;
  try {
    const res = await fetch(target, {
      headers: { "Content-Type": "application/json" },
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to reach MCP REST API" },
      { status: 502 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const { path } = await params;
  const pathStr = path.join("/");
  const target = `${MCP_REST_URL}/${pathStr}`;
  try {
    const body = await req.json().catch(() => ({}));
    const res = await fetch(target, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json(data, { status: res.status });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to reach MCP REST API" },
      { status: 502 }
    );
  }
}
