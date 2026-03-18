"use client";

import { ReactNode } from "react";
import { LeadGateProvider, useLeadGate } from "@/lib/lead-gate-context";
import LeadGateModal from "./LeadGateModal";

function GateOverlay() {
  const { gated, registered, gateMeta } = useLeadGate();

  if (!gated || registered) return null;

  return (
    <LeadGateModal
      citycode={gateMeta.citycode}
      cityName={gateMeta.cityName}
      propertyType={gateMeta.propertyType}
    />
  );
}

export default function LeadGateWrapper({ children }: { children: ReactNode }) {
  return (
    <LeadGateProvider>
      {children}
      <GateOverlay />
    </LeadGateProvider>
  );
}
