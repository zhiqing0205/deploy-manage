import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { SESSION_COOKIE_NAME, verifySessionToken } from "@/lib/auth";

function apiUnauthorized() {
  return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
}

export default function proxy(req: NextRequest) {
  // Allow health checks without auth.
  if (req.nextUrl.pathname === "/api/health") return NextResponse.next();

  const user = process.env.BASIC_AUTH_USER?.trim();
  const pass = process.env.BASIC_AUTH_PASSWORD?.trim();
  if (!user || !pass) return NextResponse.next();

  const pathname = req.nextUrl.pathname;
  if (pathname === "/login") return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE_NAME)?.value;
  if (token) {
    const session = verifySessionToken({ token, secret: pass });
    if (session?.u === user) return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) return apiUnauthorized();

  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("next", `${pathname}${req.nextUrl.search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
