import { NextRequest, NextResponse } from "next/server";

// Protect /admin and the admin API with HTTP Basic Auth.
export const config = { matcher: ["/admin/:path*", "/admin", "/api/admin/:path*"] };

export function middleware(req: NextRequest) {
  const expectedUser = process.env.ADMIN_USER || "admin";
  const expectedPass = process.env.ADMIN_PASSWORD;

  // If no password is configured, keep the data private (fail closed).
  if (!expectedPass) {
    return new NextResponse(
      "Admin is not configured. Set ADMIN_PASSWORD in the environment.",
      { status: 503 }
    );
  }

  const header = req.headers.get("authorization");
  if (header?.startsWith("Basic ")) {
    try {
      const decoded = atob(header.slice(6));
      const i = decoded.indexOf(":");
      const user = decoded.slice(0, i);
      const pass = decoded.slice(i + 1);
      if (user === expectedUser && pass === expectedPass) {
        return NextResponse.next();
      }
    } catch {
      // fall through to 401
    }
  }

  return new NextResponse("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="BIQADX Admin", charset="UTF-8"' },
  });
}
