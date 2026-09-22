"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";

export function trackEvent(name: string, properties?: Record<string, string | number>) {
  if (typeof window === "undefined") return;
  const event = { name, properties, path: window.location.pathname, timestamp: new Date().toISOString() };
  window.dispatchEvent(new CustomEvent("silva:analytics", { detail: event }));
  const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
  if (gtag) gtag("event", name, properties);
}

export function StorefrontAnalytics() {
  const pathname = usePathname();
  useEffect(() => { trackEvent("page_view", { path: pathname }); }, [pathname]);
  return null;
}
