import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function clearCookieAndRedirect(request: NextRequest) {
  const url = new URL("/admin/login", request.url);
  const response = new NextResponse(null, {
    status: 303,
    headers: { Location: url.pathname },
  });
  response.cookies.delete("admin_session");
  response.cookies.delete("admin_id");
  return response;
}

export async function GET(request: NextRequest) {
  return clearCookieAndRedirect(request);
}

export async function POST(request: NextRequest) {
  return clearCookieAndRedirect(request);
}
