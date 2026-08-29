import { NextRequest, NextResponse } from "next/server";
import { ADMIN_COOKIE, expectedSession } from "./lib/adminAuth";

// Gate /admin and the admin API behind a cookie session (set by the login page).
export const config = { matcher: ["/admin/:path*", "/admin", "/api/admin/:path*"] };

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // The login page and the login/logout endpoints must stay public.
  if (
    pathname === "/admin/login" ||
    pathname === "/api/admin/login" ||
    pathname === "/api/admin/logout"
  ) {
    return NextResponse.next();
  }

  const expected = await expectedSession();
  if (!expected) {
    return new NextResponse(
      "Admin is not configured. Set ADMIN_PASSWORD in the environment.",
      { status: 503 }
    );
  }

  const token = req.cookies.get(ADMIN_COOKIE)?.value;
  if (token && token === expected) {
    return NextResponse.next();
  }

  // Not authenticated: APIs get 401, pages get sent to the login screen.
  if (pathname.startsWith("/api/")) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/admin/login";
  return NextResponse.redirect(url);
}
