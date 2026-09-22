import { Resend } from "resend"
import type { SubscriberArgs, SubscriberConfig } from "@medusajs/framework"

export default async function passwordResetHandler({ event }: SubscriberArgs<{ entity_id: string; token: string; actor_type: string }>) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey || event.data.actor_type !== "customer") return
  const email = event.data.entity_id
  const storefrontUrl = (process.env.STOREFRONT_URL ?? "https://silvamoveis.com.br").replace(/\/$/, "")
  const resetUrl = `${storefrontUrl}/redefinir-senha?token=${encodeURIComponent(event.data.token)}&email=${encodeURIComponent(email)}`
  await new Resend(apiKey).emails.send({
    from: process.env.RESEND_FROM_EMAIL ?? "Silva Móveis <onboarding@resend.dev>",
    to: email,
    subject: "Redefina sua senha | Silva Móveis",
    html: `<p>Recebemos um pedido para redefinir sua senha.</p><p><a href="${resetUrl}">Criar nova senha</a></p><p>Este link expira em 15 minutos. Se você não solicitou, ignore este e-mail.</p>`,
  })
}

export const config: SubscriberConfig = { event: "auth.password_reset" }
