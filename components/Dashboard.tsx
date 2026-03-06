"use client";

import { DVFResult } from "@/lib/types";
import PriceCards from "./PriceCards";
import PriceTrends from "./PriceTrends";
import PropertyTypeBreakdown from "./PropertyTypeBreakdown";
import CityComparison from "./CityComparison";
import NeighborhoodMap from "./NeighborhoodMap";
import TransactionTable from "./TransactionTable";
import styles from "./Dashboard.module.css";

interface Props {
  data: DVFResult;
  lat: number;
  lon: number;
  address: string;
}

export default function Dashboard({ data, lat, lon, address }: Props) {
  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <h2 className={styles.address}>{address}</h2>
        <p className={styles.meta}>
          {data.cityName} &middot; D\u00E9partement {data.departmentCode}
        </p>
      </div>

      <PriceCards
        averagePrice={data.averagePrice}
        medianPrice={data.medianPrice}
        averagePricePerSqm={data.averagePricePerSqm}
        totalTransactions={data.totalTransactions}
      />

      <div className={styles.chartRow}>
        <PriceTrends data={data.byYear} />
        <PropertyTypeBreakdown data={data.byPropertyType} />
      </div>

      <div className={styles.chartRow}>
        <CityComparison
          data={data.byPropertyType}
          cityName={data.cityName}
        />
        <NeighborhoodMap
          transactions={data.transactions}
          centerLat={lat}
          centerLon={lon}
        />
      </div>

      <TransactionTable transactions={data.transactions} />
    </div>
  );
}
