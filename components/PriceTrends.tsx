"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { YearlyStats } from "@/lib/types";
import styles from "./ChartCard.module.css";

interface Props {
  data: YearlyStats[];
}

export default function PriceTrends({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className={styles.card}>
        <h3 className={styles.title}>Evolution des prix</h3>
        <p className={styles.empty}>Pas assez de donn\u00E9es</p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    year: d.year,
    "Prix moyen": Math.round(d.avgPrice),
    "Prix/m\u00B2": Math.round(d.avgPricePerSqm),
    Transactions: d.count,
  }));

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Evolution des prix</h3>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--md-sys-color-outline-variant)" />
            <XAxis
              dataKey="year"
              tick={{ fill: "var(--md-sys-color-on-surface-variant)", fontSize: 12 }}
            />
            <YAxis
              yAxisId="price"
              tick={{ fill: "var(--md-sys-color-on-surface-variant)", fontSize: 12 }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <YAxis
              yAxisId="sqm"
              orientation="right"
              tick={{ fill: "var(--md-sys-color-on-surface-variant)", fontSize: 12 }}
              tickFormatter={(v) => `${v}\u20AC`}
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
                String(name) === "Prix/m\u00B2"
                  ? `${Number(value).toLocaleString("fr-FR")} \u20AC/m\u00B2`
                  : `${Number(value).toLocaleString("fr-FR")} \u20AC`,
                String(name),
              ]}
            />
            <Legend />
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="Prix moyen"
              stroke="var(--md-sys-color-primary)"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
            <Line
              yAxisId="sqm"
              type="monotone"
              dataKey="Prix/m\u00B2"
              stroke="var(--md-sys-color-tertiary)"
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
