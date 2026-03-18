"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";

const STORAGE_KEY = "vvvb_gate";
const CLICK_THRESHOLD = 3;

interface GateState {
  clicks: number;
  gated: boolean;
  registered: boolean;
}

interface GateContext extends GateState {
  recordClick: (meta?: { citycode?: string; cityName?: string; propertyType?: string }) => void;
  register: () => void;
  gateMeta: { citycode?: string; cityName?: string; propertyType?: string };
}

const LeadGateContext = createContext<GateContext | null>(null);

function loadState(): GateState {
  if (typeof window === "undefined") return { clicks: 0, gated: false, registered: false };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return {
        clicks: parsed.clicks ?? 0,
        gated: parsed.gated ?? false,
        registered: parsed.registered ?? false,
      };
    }
  } catch { /* ignore */ }
  return { clicks: 0, gated: false, registered: false };
}

function saveState(state: GateState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch { /* ignore */ }
}

export function LeadGateProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<GateState>({ clicks: 0, gated: false, registered: false });
  const [gateMeta, setGateMeta] = useState<{ citycode?: string; cityName?: string; propertyType?: string }>({});
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setState(loadState());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) saveState(state);
  }, [state, mounted]);

  const recordClick = useCallback((meta?: { citycode?: string; cityName?: string; propertyType?: string }) => {
    setState((prev) => {
      if (prev.registered) return prev;
      const clicks = prev.clicks + 1;
      const gated = clicks >= CLICK_THRESHOLD;
      if (gated && meta) {
        setGateMeta(meta);
      }
      return { ...prev, clicks, gated };
    });
  }, []);

  const register = useCallback(() => {
    setState((prev) => ({ ...prev, registered: true }));
  }, []);

  return (
    <LeadGateContext.Provider value={{ ...state, recordClick, register, gateMeta }}>
      {children}
    </LeadGateContext.Provider>
  );
}

export function useLeadGate() {
  const ctx = useContext(LeadGateContext);
  if (!ctx) throw new Error("useLeadGate must be used within LeadGateProvider");
  return ctx;
}
