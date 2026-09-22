import { Resend } from "resend";

export const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
export const emailFrom = process.env.RESEND_FROM_EMAIL ?? "Silva Móveis <onboarding@resend.dev>";
