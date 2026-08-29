import { NextResponse } from "next/server";
import { ADMIN_COOKIE, expectedSession } from "../../../../lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const expectedUser = (process.env.ADMIN_USER || "admin").trim();
  const expectedPass = process.env.ADMIN_PASSWORD?.trim();

  if (!expectedPass) {
    return NextResponse.json(
      { ok: false, error: "Admin is not configured on the server." },
      { status: 503 }
    );
  }

  let body: { user?: string; password?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const user = String(body.user ?? "").trim();
  const pass = String(body.password ?? "");

  if (user !== expectedUser || pass !== expectedPass) {
    return NextResponse.json(
      { ok: false, error: "Incorrect username or password." },
      { status: 401 }
    );
  }

  // Mark the cookie "secure" only when the public connection is HTTPS, so
  // login works on http too and behind Hostinger's proxy (x-forwarded-proto).
  const proto =
    req.headers.get("x-forwarded-proto") ||
    new URL(req.url).protocol.replace(":", "");
  const isHttps = proto.split(",")[0].trim() === "https";

  const token = (await expectedSession())!;
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isHttps,
    path: "/",
    maxAge: 60 * 60 * 8, // 8 hours
  });
  return res;
}
