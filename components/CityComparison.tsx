"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
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
        <p className={styles.empty}>Pas assez de donn\u00E9es</p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.type,
    "Prix moyen": Math.round(d.avgPrice),
    "Prix/m\u00B2": Math.round(d.avgPricePerSqm),
  }));

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>
        Prix par type de bien \u00E0 {cityName}
      </h3>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--md-sys-color-outline-variant)" />
            <XAxis
              dataKey="name"
              tick={{ fill: "var(--md-sys-color-on-surface-variant)", fontSize: 12 }}
            />
            <YAxis
              tick={{ fill: "var(--md-sys-color-on-surface-variant)", fontSize: 12 }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip
              contentStyle={{
                background: "var(--md-sys-color-surface-container)",
                border: "1px solid var(--md-sys-color-outline-variant)",
                borderRadius: "8px",
                color: "var(--md-sys-color-on-surface)",
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, name: any) => [
                `${Number(value).toLocaleString("fr-FR")} \u20AC`,
                String(name),
              ]}
            />
            <Bar
              dataKey="Prix moyen"
              fill="var(--md-sys-color-primary)"
              radius={[6, 6, 0, 0]}
            />
            <Bar
              dataKey="Prix/m\u00B2"
              fill="var(--md-sys-color-tertiary)"
              radius={[6, 6, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
