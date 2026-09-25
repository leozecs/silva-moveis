"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CART_STORAGE_KEY } from "@/lib/cart";

export function CustomerLogoutButton() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleLogout() {
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/auth/logout", { method: "POST" });
      if (!response.ok) throw new Error();
      window.localStorage.removeItem(CART_STORAGE_KEY);
      window.localStorage.setItem("silva_session_changed", crypto.randomUUID());
      window.dispatchEvent(new Event("silva-session-changed"));
      router.push("/acesso");
      router.refresh();
    } catch { setError("Não foi possível sair. Tente novamente."); }
    finally { setBusy(false); }
  }

  return (
    <div><Button type="button" variant="outline" onClick={handleLogout} disabled={busy}>
      {busy ? "Saindo..." : "Sair"}
    </Button>{error ? <p role="alert" className="mt-2 text-sm text-destructive">{error}</p> : null}</div>
  );
}
