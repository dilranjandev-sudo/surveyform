import { NextResponse } from "next/server";
import {
  ADMIN_COOKIE,
  credHash,
  getStoredAdmin,
  sessionTokenFor,
} from "../../../../lib/adminAuth";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const admin = await getStoredAdmin();
  if (!admin) {
    return NextResponse.json(
      { ok: false, error: "Admin password is not set up yet." },
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
  const hash = await credHash(user, pass);

  if (user !== admin.username || hash !== admin.password_hash) {
    return NextResponse.json(
      { ok: false, error: "Incorrect username or password." },
      { status: 401 }
    );
  }

  // "secure" only over HTTPS, so it works on http and behind Hostinger's proxy.
  const proto =
    req.headers.get("x-forwarded-proto") ||
    new URL(req.url).protocol.replace(":", "");
  const isHttps = proto.split(",")[0].trim() === "https";

  const token = await sessionTokenFor(admin.password_hash);
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
