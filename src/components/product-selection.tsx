"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

const Selection = createContext<{ selected: string; select: (id: string) => void } | null>(null);

export function ProductSelection({ initialId, children }: { initialId: string; children: ReactNode }) {
  const [selected, select] = useState(initialId);
  return <Selection.Provider value={{ selected, select }}>{children}</Selection.Provider>;
}

export function useProductSelection() { return useContext(Selection); }
