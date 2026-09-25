import { NextResponse } from "next/server";
import { assertSameOrigin } from "@/lib/http-policy";
import { storeFailure } from "@/lib/store-server";

export async function POST(request: Request) {
  try { assertSameOrigin(request); } catch (error) { return storeFailure(error); }
  const result = NextResponse.json({ ok: true });
  result.cookies.set("medusa_merchant_token", "", { expires: new Date(0), path: "/", httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" });
  result.cookies.set("medusa_customer_token", "", {
    expires: new Date(0),
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return result;
}
