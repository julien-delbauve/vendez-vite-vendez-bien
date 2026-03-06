"use client";

import { useEffect, useState } from "react";
import { Transaction } from "@/lib/types";
import styles from "./ChartCard.module.css";

interface Props {
  transactions: Transaction[];
  centerLat: number;
  centerLon: number;
}

// Dynamic import to avoid SSR issues with Leaflet
function MapInner({
  transactions,
  centerLat,
  centerLon,
}: Props) {
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
    return <div style={{ height: 400, background: "var(--md-sys-color-surface-container-high)", borderRadius: 12 }} />;
  }

  const { MapContainer, TileLayer, CircleMarker, Popup } = mapComponents;

  const geoTransactions = transactions.filter((t) => t.lat && t.lon);

  return (
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
      {geoTransactions.map((tx, i) => (
        <CircleMarker
          key={i}
          center={[tx.lat!, tx.lon!]}
          radius={6}
          fillColor="var(--md-sys-color-primary)"
          color="var(--md-sys-color-on-primary)"
          weight={1}
          fillOpacity={0.7}
        >
          <Popup>
            <strong>{tx.propertyType}</strong>
            <br />
            {Math.round(tx.price).toLocaleString("fr-FR")} \u20AC
            {tx.surface > 0 && (
              <>
                <br />
                {tx.surface} m\u00B2 ({Math.round(tx.pricePerSqm).toLocaleString("fr-FR")} \u20AC/m\u00B2)
              </>
            )}
            <br />
            <em>{tx.date}</em>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
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
