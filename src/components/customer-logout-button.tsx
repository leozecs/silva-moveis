"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function CustomerLogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/acesso");
    router.refresh();
  }

  return (
    <Button type="button" variant="outline" onClick={handleLogout}>
      Sair
    </Button>
  );
}
