import { createCipheriv, createDecipheriv, createHash, createHmac, randomBytes, randomInt } from "node:crypto";

const secret = process.env.AUTH_CODE_SECRET ?? process.env.COOKIE_SECRET ?? "local-development-only";
const key = createHash("sha256").update(secret).digest();
type PendingRegistration = { name: string; email: string; password: string; codeHash: string; expiresAt: number };

export function createRegistrationChallenge(data: Omit<PendingRegistration, "codeHash" | "expiresAt">) {
  const code = String(randomInt(100000, 1000000)); const payload = JSON.stringify({ ...data, codeHash: createHmac("sha256", secret).update(code).digest("hex"), expiresAt: Date.now() + 15 * 60 * 1000 }); const iv = randomBytes(12); const cipher = createCipheriv("aes-256-gcm", key, iv); const encrypted = Buffer.concat([cipher.update(payload, "utf8"), cipher.final()]); const value = [iv.toString("base64url"), cipher.getAuthTag().toString("base64url"), encrypted.toString("base64url")].join("."); return { code, cookie: value };
}

export function readRegistrationChallenge(value: string | undefined, code: string) {
  if (!value) return null; const [ivValue, tagValue, encryptedValue] = value.split("."); if (!ivValue || !tagValue || !encryptedValue) return null;
  try { const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivValue, "base64url")); decipher.setAuthTag(Buffer.from(tagValue, "base64url")); const decoded = Buffer.concat([decipher.update(Buffer.from(encryptedValue, "base64url")), decipher.final()]).toString("utf8"); const data = JSON.parse(decoded) as PendingRegistration; const hash = createHmac("sha256", secret).update(code).digest("hex"); return data.expiresAt >= Date.now() && hash === data.codeHash ? data : null; } catch { return null; }
}
