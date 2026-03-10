"use client";

import { useState, useMemo, useCallback } from "react";
import { DVFResult } from "@/lib/types";
import { computeStats, computeMonthlyStats } from "@/lib/compute-stats";
import PriceCards from "./PriceCards";
import PriceTrends from "./PriceTrends";
import NeighborhoodMap from "./NeighborhoodMap";
import TransactionTable from "./TransactionTable";
import DataFreshness from "./DataFreshness";
import FilterBar from "./FilterBar";
import styles from "./Dashboard.module.css";

const NAV_ITEMS = [
  { id: "map", icon: "M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7", label: "Carte" },
  { id: "charts", icon: "M3 13h2v8H3zm6-4h2v12H9zm6-6h2v18h-2zm6 10h2v8h-2z", label: "Tendances" },
  { id: "table", icon: "M3 10h18M3 14h18M3 6h18M3 18h18M10 6v12M17 6v12", label: "Transactions" },
];

interface Props {
  data: DVFResult;
  lat: number;
  lon: number;
  cityCode?: string;
  onSearchArea?: (citycode: string, cityName: string, lat: number, lon: number) => void;
}

export default function Dashboard({ data, lat, lon, cityCode, onSearchArea }: Props) {
  const [activeSection, setActiveSection] = useState("map");

  const handleNavigate = useCallback((section: string) => {
    setActiveSection(section);
    const el = document.getElementById(`section-${section}`);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const defaultYear = useMemo(() => {
    const years = data.transactions
      .map((t) => parseInt(t.date.substring(0, 4)))
      .filter((y) => y >= 2023);
    return years.length > 0 ? Math.max(...years) : null;
  }, [data.transactions]);

  const [selectedYear, setSelectedYear] = useState<number | null>(defaultYear);
  const [selectedType, setSelectedType] = useState<string | null>("Appartement");
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);

  const filteredTransactions = useMemo(() => {
    return data.transactions.filter((tx) => {
      if (selectedYear) {
        const year = parseInt(tx.date.substring(0, 4));
        if (year !== selectedYear) return false;
      }
      if (selectedType) {
        if (tx.propertyType !== selectedType) return false;
      }
      if (selectedRoom && tx.propertyType === "Appartement") {
        const rooms = tx.rooms || 0;
        const label = rooms >= 5 ? "T5+" : rooms >= 1 ? `T${rooms}` : null;
        if (label !== selectedRoom) return false;
      }
      return true;
    });
  }, [data.transactions, selectedYear, selectedType, selectedRoom]);

  const typeFilteredTransactions = useMemo(() => {
    return data.transactions.filter((tx) => {
      const year = parseInt(tx.date.substring(0, 4));
      if (year < 2023) return false;
      if (selectedType && tx.propertyType !== selectedType) return false;
      if (selectedRoom && tx.propertyType === "Appartement") {
        const rooms = tx.rooms || 0;
        const label = rooms >= 5 ? "T5+" : rooms >= 1 ? `T${rooms}` : null;
        if (label !== selectedRoom) return false;
      }
      return true;
    });
  }, [data.transactions, selectedType, selectedRoom]);

  const stats = useMemo(
    () => computeStats(filteredTransactions),
    [filteredTransactions]
  );

  const monthlyStats = useMemo(
    () => computeMonthlyStats(typeFilteredTransactions),
    [typeFilteredTransactions]
  );

  return (
    <div className={styles.dashboard}>
      {/* Left panel: city info, filters, cards, nav */}
      <aside className={styles.leftPanel}>
        <a href="/" className={styles.logo}>
          vendez<span className={styles.accentOrange}>vite</span>vendez<span className={styles.accent}>bien</span>.fr
        </a>

        <div className={styles.panelHeader}>
          <h2 className={styles.address}>Marché immobilier à {data.cityName}</h2>
        </div>

        <div className={styles.panelSection}>
          <FilterBar
            transactions={data.transactions}
            selectedYear={selectedYear}
            selectedType={selectedType}
            selectedRoom={selectedRoom}
            onYearChange={setSelectedYear}
            onTypeChange={setSelectedType}
            onRoomChange={setSelectedRoom}
          />
        </div>

        <div className={styles.panelSection}>
          <PriceCards
            averagePrice={stats.averagePrice}
            averagePricePerSqm={stats.averagePricePerSqm}
            totalTransactions={filteredTransactions.length}
          />
        </div>

        <div className={styles.panelDivider} />

        <nav className={styles.panelNav}>
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              className={`${styles.navItem} ${activeSection === item.id ? styles.navActive : ""}`}
              onClick={() => handleNavigate(item.id)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon} />
              </svg>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

      </aside>

      {/* Mobile top controls (hidden on desktop) */}
      <div className={styles.mobileControls}>
        <div className={styles.mobileHeader}>
          <h2 className={styles.mobileAddress}>{data.cityName}</h2>
          <DataFreshness date={data.dataFreshness} />
        </div>
        <FilterBar
          transactions={data.transactions}
          selectedYear={selectedYear}
          selectedType={selectedType}
          selectedRoom={selectedRoom}
          onYearChange={setSelectedYear}
          onTypeChange={setSelectedType}
          onRoomChange={setSelectedRoom}
        />
        <PriceCards
          averagePrice={stats.averagePrice}
          averagePricePerSqm={stats.averagePricePerSqm}
          totalTransactions={filteredTransactions.length}
        />
      </div>

      {/* Right content: map, chart, table */}
      <div className={styles.rightContent}>
        <div id="section-map" className={styles.mapSection}>
          <NeighborhoodMap
            transactions={filteredTransactions}
            centerLat={lat}
            centerLon={lon}
            colorByRoom={selectedType === "Appartement" && !selectedRoom}
            onSearchArea={onSearchArea}
            currentCityCode={cityCode}
          />
          <DataFreshness date={data.dataFreshness} />
        </div>

        <div id="section-charts" className={styles.chartsSection}>
          <PriceTrends yearlyData={[]} monthlyData={monthlyStats} />
        </div>

        <div id="section-table" className={styles.tableSection}>
          <TransactionTable transactions={filteredTransactions} />
        </div>
      </div>

      {/* Mobile bottom nav */}
      <div className={styles.mobileNav}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`${styles.mobileNavItem} ${activeSection === item.id ? styles.mobileNavActive : ""}`}
            onClick={() => handleNavigate(item.id)}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d={item.icon} />
            </svg>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
