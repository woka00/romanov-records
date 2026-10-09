import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:8080";
const COOKIE_NAME = "admin_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function isSecureRequest(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-proto") === "https" ||
    request.nextUrl.protocol === "https:"
  );
}

function redirectTo(request: NextRequest, pathname: string, error?: string) {
  const url = new URL(pathname, request.url);
  if (error) {
    url.searchParams.set("error", error);
  }
  return new NextResponse(null, {
    status: 303,
    headers: { Location: `${url.pathname}${url.search}` },
  });
}

export async function POST(request: NextRequest) {
  const formData = await request.formData();
  const login = String(formData.get("login") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!login || !password) {
    return redirectTo(request, "/admin/login", "empty");
  }

  let backendRes: Response;
  try {
    backendRes = await fetch(`${BACKEND}/api/v1/admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ login, password }),
      cache: "no-store",
    });
  } catch {
    return redirectTo(request, "/admin/login", "network");
  }

  if (!backendRes.ok) {
    return redirectTo(request, "/admin/login", "invalid");
  }

  let data: { id?: unknown };
  try {
    data = await backendRes.json();
  } catch {
    return redirectTo(request, "/admin/login", "invalid");
  }

  const session = readCookie(backendRes.headers.get("set-cookie"), COOKIE_NAME);
  if (data.id === undefined || data.id === null || data.id === "" || !session) {
    return redirectTo(request, "/admin/login", "invalid");
  }

  const response = redirectTo(request, "/admin");
  response.cookies.set(COOKIE_NAME, session, {
    path: "/",
    httpOnly: true,
    secure: isSecureRequest(request),
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
  });

  return response;
}

function readCookie(header: string | null, name: string): string | null {
  if (!header) return null;
  const prefix = `${name}=`;
  const cookie = header.split(";")[0];
  return cookie.startsWith(prefix) ? cookie.slice(prefix.length) : null;
}
