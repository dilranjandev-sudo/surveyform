import { NextRequest, NextResponse } from "next/server";

// Lightweight gate: redirect visitors without a session cookie to the login
// page (nice UX). The REAL verification — matching the cookie against the
// password hash in the database — happens in the /admin page and admin API
// routes (which run on Node and can query the DB). Edge middleware can't reach
// the DB, so it only checks that a cookie is present.
const ADMIN_COOKIE = "fs_admin";
export const config = { matcher: ["/admin/:path*", "/admin", "/api/admin/:path*"] };

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Public endpoints.
  if (
    pathname === "/admin/login" ||
    pathname === "/api/admin/login" ||
    pathname === "/api/admin/logout"
  ) {
    return NextResponse.next();
  }

  if (req.cookies.get(ADMIN_COOKIE)?.value) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  return NextResponse.redirect(url);
}
