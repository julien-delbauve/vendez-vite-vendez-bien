"use client";

import { useState, useMemo } from "react";
import { DVFResult } from "@/lib/types";
import { computeStats, computeMonthlyStats } from "@/lib/compute-stats";
import PriceCards from "./PriceCards";
import PriceTrends from "./PriceTrends";
import PropertyTypeBreakdown from "./PropertyTypeBreakdown";
import CityComparison from "./CityComparison";
import NeighborhoodMap from "./NeighborhoodMap";
import TransactionTable from "./TransactionTable";
import DataFreshness from "./DataFreshness";
import FilterBar from "./FilterBar";
import styles from "./Dashboard.module.css";

interface Props {
  data: DVFResult;
  lat: number;
  lon: number;
}

export default function Dashboard({ data, lat, lon }: Props) {
  const [selectedYears, setSelectedYears] = useState<number[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);

  const filteredTransactions = useMemo(() => {
    return data.transactions.filter((tx) => {
      if (selectedYears.length > 0) {
        const year = parseInt(tx.date.substring(0, 4));
        if (!selectedYears.includes(year)) return false;
      }
      if (selectedTypes.length > 0) {
        if (!selectedTypes.includes(tx.propertyType)) return false;
      }
      if (selectedRooms.length > 0 && tx.propertyType === "Appartement") {
        const rooms = tx.rooms || 0;
        const label = rooms >= 5 ? "T5+" : rooms >= 1 ? `T${rooms}` : null;
        if (!label || !selectedRooms.includes(label)) return false;
      }
      return true;
    });
  }, [data.transactions, selectedYears, selectedTypes, selectedRooms]);

  const stats = useMemo(
    () => computeStats(filteredTransactions),
    [filteredTransactions]
  );

  const useMonthly = selectedYears.length === 1 || selectedYears.length === 2;

  const monthlyStats = useMemo(
    () => (useMonthly ? computeMonthlyStats(filteredTransactions) : []),
    [filteredTransactions, useMonthly]
  );

  const hasFilters = selectedYears.length > 0 || selectedTypes.length > 0;

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h2 className={styles.address}>Marché immobilier à {data.cityName}</h2>
        <p className={styles.meta}>
          {data.cityName} &middot; Département {data.departmentCode}
        </p>
        <DataFreshness date={data.dataFreshness} />
      </div>

      <FilterBar
        transactions={data.transactions}
        selectedYears={selectedYears}
        selectedTypes={selectedTypes}
        selectedRooms={selectedRooms}
        onYearsChange={setSelectedYears}
        onTypesChange={setSelectedTypes}
        onRoomsChange={setSelectedRooms}
      />

      <PriceCards
        averagePrice={stats.averagePrice}
        medianPrice={stats.medianPrice}
        averagePricePerSqm={stats.averagePricePerSqm}
        totalTransactions={hasFilters ? filteredTransactions.length : data.totalTransactions}
      />

      <div className={styles.chartRow}>
        <PriceTrends yearlyData={stats.byYear} monthlyData={useMonthly ? monthlyStats : undefined} />
        <PropertyTypeBreakdown data={stats.byPropertyType} />
      </div>

      <div className={styles.chartRow}>
        <CityComparison
          data={stats.byPropertyType}
          cityName={data.cityName}
        />
        <NeighborhoodMap
          transactions={filteredTransactions}
          centerLat={lat}
          centerLon={lon}
        />
      </div>

      <TransactionTable transactions={filteredTransactions} />
    </div>
  );
}
