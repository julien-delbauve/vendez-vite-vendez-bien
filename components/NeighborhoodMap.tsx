"use client";

import { useEffect, useState } from "react";
import { Transaction } from "@/lib/types";
import styles from "./ChartCard.module.css";
import mapStyles from "./NeighborhoodMap.module.css";

interface Props {
  transactions: Transaction[];
  centerLat: number;
  centerLon: number;
}

const COLORS: Record<string, string> = {
  "Appt. T1":  "#7C3AED", // violet
  "Appt. T2":  "#A855F7", // purple
  "Appt. T3":  "#C084FC", // light purple
  "Appt. T4":  "#D8B4FE", // lavender
  "Appt. T5+": "#EDE9FE", // pale purple
  "Appt.":     "#A855F7", // fallback purple (no room info)
  Maison:      "#CDEA68", // lime
  Commercial:  "#F59E0B", // amber
  Terrain:     "#7C7C8A", // gray
};

function getLabel(tx: Transaction): string {
  if (tx.propertyType === "Appartement") {
    if (tx.rooms && tx.rooms >= 1) {
      return `Appt. T${tx.rooms >= 5 ? "5+" : tx.rooms}`;
    }
    return "Appt.";
  }
  return tx.propertyType;
}

function getColor(label: string): string {
  return COLORS[label] || "#CDEA68";
}

// Desired legend order
const LEGEND_ORDER = [
  "Appt. T1", "Appt. T2", "Appt. T3", "Appt. T4", "Appt. T5+", "Appt.",
  "Maison", "Commercial", "Terrain",
];

function MapInner({ transactions, centerLat, centerLon }: Props) {
  const [mapComponents, setMapComponents] = useState<{
    MapContainer: typeof import("react-leaflet").MapContainer;
    TileLayer: typeof import("react-leaflet").TileLayer;
    CircleMarker: typeof import("react-leaflet").CircleMarker;
    Popup: typeof import("react-leaflet").Popup;
  } | null>(null);

  useEffect(() => {
    import("react-leaflet").then((mod) => {
      setMapComponents({
        MapContainer: mod.MapContainer,
        TileLayer: mod.TileLayer,
        CircleMarker: mod.CircleMarker,
        Popup: mod.Popup,
      });
    });
  }, []);

  if (!mapComponents) {
    return <div style={{ height: 400, background: "var(--color-surface-variant)", borderRadius: 12 }} />;
  }

  const { MapContainer, TileLayer, CircleMarker, Popup } = mapComponents;

  const geoTransactions = transactions.filter((t) => t.lat && t.lon);

  const presentLabels = new Set(geoTransactions.map(getLabel));
  const legendLabels = LEGEND_ORDER.filter((l) => presentLabels.has(l));

  return (
    <>
      <MapContainer
        center={[centerLat, centerLon]}
        zoom={14}
        style={{ height: 400, borderRadius: 12 }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {geoTransactions.map((tx, i) => {
          const label = getLabel(tx);
          return (
            <CircleMarker
              key={i}
              center={[tx.lat!, tx.lon!]}
              radius={6}
              fillColor={getColor(label)}
              color="#1A1A2E"
              weight={1}
              fillOpacity={0.8}
            >
              <Popup>
                <strong>{label}</strong>
                {tx.address && (
                  <>
                    <br />
                    {tx.address}
                  </>
                )}
                <br />
                {Math.round(tx.price).toLocaleString("fr-FR")} €
                {tx.surface > 0 && (
                  <>
                    <br />
                    {tx.surface} m² ({Math.round(tx.pricePerSqm).toLocaleString("fr-FR")} €/m²)
                  </>
                )}
                <br />
                <em>{tx.date}</em>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
      <div className={mapStyles.legend}>
        {legendLabels.map((label) => (
          <div key={label} className={mapStyles.legendItem}>
            <span
              className={mapStyles.legendDot}
              style={{ background: getColor(label) }}
            />
            <span className={mapStyles.legendLabel}>{label}</span>
          </div>
        ))}
      </div>
    </>
  );
}

export default function NeighborhoodMap(props: Props) {
  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Carte du quartier</h3>
      <MapInner {...props} />
    </div>
  );
}
