"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { setVisible(window.localStorage.getItem("silva_cookie_consent") !== "accepted"); }, []);
  if (!visible) return null;
  function accept() { window.localStorage.setItem("silva_cookie_consent", "accepted"); setVisible(false); }
  return <aside role="dialog" aria-label="Preferências de cookies" className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl rounded-xl border border-black/10 bg-white p-5 shadow-2xl"><p className="font-semibold">Privacidade e cookies</p><p className="mt-2 text-sm leading-6 text-muted-foreground">Usamos cookies necessários para manter sua sessão e seu carrinho. Ao continuar, você concorda com nossa <a className="underline" href="/politica-de-privacidade">política de privacidade</a>.</p><div className="mt-4 flex justify-end"><Button onClick={accept}>Aceitar</Button></div></aside>;
}
