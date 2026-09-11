import { NextResponse } from "next/server";

export async function POST() {
  const result = NextResponse.json({ ok: true });
  result.cookies.set("medusa_customer_token", "", {
    expires: new Date(0),
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return result;
}
