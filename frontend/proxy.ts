import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function redirectTo(request: NextRequest, pathname: string) {
  const protocol = request.headers.get("x-forwarded-proto") ?? request.nextUrl.protocol.replace(":", "");
  const host = request.headers.get("host") ?? request.nextUrl.host;
  const url = new URL(pathname, `${protocol}://${host}`);

  return new NextResponse(null, {
    status: 307,
    headers: { Location: url.toString() },
  });
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAuthenticated = request.cookies.has("admin_session");

  if (pathname.startsWith("/admin/logout")) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin/login")) {
    if (isAuthenticated && request.method === "GET") {
      return redirectTo(request, "/admin");
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin")) {
    if (!isAuthenticated) {
      return redirectTo(request, "/admin/login");
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
