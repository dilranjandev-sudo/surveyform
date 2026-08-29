// Shared admin-auth helpers. Uses Web Crypto only, so it works in BOTH the
// edge middleware and the Node API routes.

export const ADMIN_COOKIE = "fs_admin";

export async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * The session cookie value proves knowledge of the admin password without
 * storing it: a one-way hash of user:pass. Returns null if not configured.
 */
export async function expectedSession(): Promise<string | null> {
  const user = (process.env.ADMIN_USER || "admin").trim();
  const pass = process.env.ADMIN_PASSWORD?.trim();
  if (!pass) return null;
  return sha256Hex(`${user}:${pass}:field-study-admin-v1`);
}
