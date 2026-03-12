"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { PropertyTypeStats } from "@/lib/types";
import styles from "./ChartCard.module.css";

interface Props {
  data: PropertyTypeStats[];
  cityName: string;
}

export default function CityComparison({ data, cityName }: Props) {
  if (data.length === 0) {
    return (
      <div className={styles.card}>
        <h3 className={styles.title}>Comparaison par type</h3>
        <p className={styles.empty}>Pas assez de données</p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.type,
    "Prix moyen": Math.round(d.avgPrice),
    "Prix/m²": Math.round(d.avgPricePerSqm),
  }));

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>
        Prix par type de bien à {cityName}
      </h3>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#DDE9E6" />
            <XAxis
              dataKey="name"
              tick={{ fill: "#6B8A99", fontSize: 12 }}
            />
            <YAxis
              yAxisId="price"
              tick={{ fill: "#6B8A99", fontSize: 12 }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <YAxis
              yAxisId="sqm"
              orientation="right"
              tick={{ fill: "#6B8A99", fontSize: 12 }}
              tickFormatter={(v) => `${v}€`}
            />
            <Tooltip
              contentStyle={{
                background: "#FFFFFF",
                border: "1px solid #DDE9E6",
                borderRadius: "12px",
                color: "#1B3A4B",
                fontFamily: "Space Grotesk",
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, name: any) => [
                String(name) === "Prix/m²"
                  ? `${Number(value).toLocaleString("fr-FR")} €/m²`
                  : `${Number(value).toLocaleString("fr-FR")} €`,
                String(name),
              ]}
            />
            <Legend />
            <Bar
              yAxisId="price"
              dataKey="Prix moyen"
              fill="#29d9de"
              radius={[8, 8, 0, 0]}
            />
            <Bar
              yAxisId="sqm"
              dataKey="Prix/m²"
              fill="#E8874A"
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
