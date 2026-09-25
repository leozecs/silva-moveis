import { cookies } from "next/headers";

export function isMerchantEmail(email: string) {
  const allowed = (process.env.MEDUSA_MERCHANT_EMAILS ?? "").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
  return allowed.includes(email.trim().toLowerCase());
}

export async function getMerchantSession(token?: string) {
  const accessToken = token ?? (await cookies()).get("medusa_merchant_token")?.value;
  const base = (process.env.MEDUSA_BACKEND_URL ?? process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL)?.replace(/\/$/, "");
  if (!accessToken || !base) return null;
  try {
    const response = await fetch(`${base}/admin/users/me`, { headers: { Authorization: `Bearer ${accessToken}` }, cache: "no-store", signal: AbortSignal.timeout(10000) });
    if (!response.ok) return null;
    const { user } = await response.json() as { user?: { id: string; email: string } };
    return user?.id && isMerchantEmail(user.email) ? user : null;
  } catch { return null; }
}
