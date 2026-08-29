import { NextResponse } from "next/server";
import { ADMIN_COOKIE } from "../../../../lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const res = NextResponse.redirect(new URL("/admin/login", req.url));
  res.cookies.set(ADMIN_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
  return res;
}
