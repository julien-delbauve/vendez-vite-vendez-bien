"use client";

import { useEffect, useState, useCallback } from "react";
import { Transaction } from "@/lib/types";
import styles from "./NeighborhoodMap.module.css";

interface Props {
  transactions: Transaction[];
  centerLat: number;
  centerLon: number;
  colorByRoom?: boolean;
  onSearchArea?: (citycode: string, cityName: string, lat: number, lon: number) => void;
  currentCityCode?: string;
}

const TYPE_COLORS: Record<string, string> = {
  Appartement: "#4ECDC4",
  Maison:      "#E8874A",
  Commercial:  "#F5C26B",
  Terrain:     "#6B8A99",
};

const ROOM_COLORS: Record<string, string> = {
  T1: "#4ECDC4",
  T2: "#3BA89F",
  T3: "#E8874A",
  T4: "#F5C26B",
  "T5+": "#6B8A99",
};

function getRoomLabel(tx: Transaction): string | null {
  const rooms = tx.rooms || 0;
  if (rooms < 1) return null;
  if (rooms >= 5) return "T5+";
  return `T${rooms}`;
}

function getLabel(tx: Transaction): string {
  if (tx.propertyType === "Appartement") {
    if (tx.rooms && tx.rooms >= 1) {
      return `Appt. T${tx.rooms >= 5 ? "5+" : tx.rooms}`;
    }
    return "Appt.";
  }
  return tx.propertyType;
}

function getColor(tx: Transaction, colorByRoom: boolean): string {
  if (colorByRoom && tx.propertyType === "Appartement") {
    const label = getRoomLabel(tx);
    if (label) return ROOM_COLORS[label] || "#4ECDC4";
  }
  return TYPE_COLORS[tx.propertyType] || "#4ECDC4";
}

const LEGEND_ORDER = ["Appartement", "Maison", "Commercial", "Terrain"];
const ROOM_LEGEND_ORDER = ["T1", "T2", "T3", "T4", "T5+"];

interface FoundCommune {
  code: string;
  nom: string;
  lat: number;
  lon: number;
}

function MapEventHandler({
  currentCityCode,
  onCommuneFound,
}: {
  currentCityCode?: string;
  onCommuneFound: (commune: FoundCommune | null) => void;
}) {
  const [mapEvents, setMapEvents] = useState<{
    useMapEvents: typeof import("react-leaflet").useMapEvents;
  } | null>(null);

  useEffect(() => {
    import("react-leaflet").then((mod) => {
      setMapEvents({ useMapEvents: mod.useMapEvents });
    });
  }, []);

  if (!mapEvents) return null;

  return (
    <MapEventHandlerInner
      useMapEvents={mapEvents.useMapEvents}
      currentCityCode={currentCityCode}
      onCommuneFound={onCommuneFound}
    />
  );
}

function MapEventHandlerInner({
  useMapEvents,
  currentCityCode,
  onCommuneFound,
}: {
  useMapEvents: typeof import("react-leaflet").useMapEvents;
  currentCityCode?: string;
  onCommuneFound: (commune: FoundCommune | null) => void;
}) {
  const timerRef = useState<ReturnType<typeof setTimeout> | null>(null);

  useMapEvents({
    moveend: (e) => {
      const map = e.target;
      const center = map.getCenter();
      const lat = center.lat;
      const lon = center.lng;

      if (timerRef[0]) clearTimeout(timerRef[0]);
      timerRef[0] = setTimeout(async () => {
        try {
          const res = await fetch(
            `https://geo.api.gouv.fr/communes?lat=${lat}&lon=${lon}&fields=code,nom,centre&limit=1`
          );
          if (!res.ok) return;
          const communes = await res.json();
          if (communes.length > 0) {
            const c = communes[0];
            if (c.code !== currentCityCode) {
              onCommuneFound({
                code: c.code,
                nom: c.nom,
                lat,
                lon,
              });
            } else {
              onCommuneFound(null);
            }
          }
        } catch {
          // silently fail
        }
      }, 500);
    },
  });

  return null;
}

function MapInner({
  transactions,
  centerLat,
  centerLon,
  colorByRoom = false,
  onSearchArea,
  currentCityCode,
}: Props) {
  const [mapComponents, setMapComponents] = useState<{
    MapContainer: typeof import("react-leaflet").MapContainer;
    TileLayer: typeof import("react-leaflet").TileLayer;
    CircleMarker: typeof import("react-leaflet").CircleMarker;
    Popup: typeof import("react-leaflet").Popup;
  } | null>(null);

  const [foundCommune, setFoundCommune] = useState<FoundCommune | null>(null);

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

  const handleCommuneFound = useCallback((commune: FoundCommune | null) => {
    setFoundCommune(commune);
  }, []);

  const handleSearchClick = useCallback(() => {
    if (foundCommune && onSearchArea) {
      onSearchArea(foundCommune.code, foundCommune.nom, foundCommune.lat, foundCommune.lon);
      setFoundCommune(null);
    }
  }, [foundCommune, onSearchArea]);

  if (!mapComponents) {
    return <div className={styles.mapPlaceholder} />;
  }

  const { MapContainer, TileLayer, CircleMarker, Popup } = mapComponents;

  const geoTransactions = transactions.filter((t) => t.lat && t.lon);

  // Build legend based on mode
  let legendItems: { label: string; color: string }[];
  if (colorByRoom) {
    const presentRooms = new Set(
      geoTransactions
        .filter((t) => t.propertyType === "Appartement")
        .map((t) => getRoomLabel(t))
        .filter(Boolean)
    );
    legendItems = ROOM_LEGEND_ORDER
      .filter((l) => presentRooms.has(l))
      .map((l) => ({ label: l, color: ROOM_COLORS[l] }));
  } else {
    const presentTypes = new Set(geoTransactions.map((t) => t.propertyType));
    legendItems = LEGEND_ORDER
      .filter((l) => presentTypes.has(l))
      .map((l) => ({ label: l, color: TYPE_COLORS[l] }));
  }

  return (
    <>
      <MapContainer
        center={[centerLat, centerLon]}
        zoom={14}
        className={styles.map}
        scrollWheelZoom={false}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        {onSearchArea && (
          <MapEventHandler
            currentCityCode={currentCityCode}
            onCommuneFound={handleCommuneFound}
          />
        )}
        {geoTransactions.map((tx, i) => {
          const label = getLabel(tx);
          return (
            <CircleMarker
              key={i}
              center={[tx.lat!, tx.lon!]}
              radius={7}
              fillColor={getColor(tx, colorByRoom)}
              color="rgba(255,255,255,0.8)"
              weight={1.5}
              fillOpacity={0.85}
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

      {foundCommune && onSearchArea && (
        <button className={styles.searchAreaBtn} onClick={handleSearchClick}>
          Rechercher à {foundCommune.nom}
        </button>
      )}

      <div className={styles.legendOverlay}>
        {legendItems.map((item) => (
          <div key={item.label} className={styles.legendItem}>
            <span
              className={styles.legendDot}
              style={{ background: item.color }}
            />
            <span className={styles.legendLabel}>{item.label}</span>
          </div>
        ))}
      </div>
    </>
  );
}

export default function NeighborhoodMap(props: Props) {
  return (
    <div className={styles.mapWrapper}>
      <MapInner {...props} />
    </div>
  );
}
