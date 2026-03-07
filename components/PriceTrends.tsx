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
import { YearlyStats, MonthlyStats } from "@/lib/types";
import styles from "./ChartCard.module.css";

interface Props {
  yearlyData: YearlyStats[];
  monthlyData?: MonthlyStats[];
}

export default function PriceTrends({ yearlyData, monthlyData }: Props) {
  const useMonthly = monthlyData && monthlyData.length > 0;
  const sourceData = useMonthly ? monthlyData : yearlyData;

  if (sourceData.length === 0) {
    return (
      <div className={styles.card}>
        <h3 className={styles.title}>Evolution des prix</h3>
        <p className={styles.empty}>Pas assez de données</p>
      </div>
    );
  }

  const chartData = useMonthly
    ? monthlyData.map((d) => ({
        label: d.label,
        "Prix moyen": Math.round(d.avgPrice),
        "Prix/m²": Math.round(d.avgPricePerSqm),
        Transactions: d.count,
      }))
    : yearlyData.map((d) => ({
        label: String(d.year),
        "Prix moyen": Math.round(d.avgPrice),
        "Prix/m²": Math.round(d.avgPricePerSqm),
        Transactions: d.count,
      }));

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Evolution des prix</h3>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E8E8EA" />
            <XAxis
              dataKey="label"
              tick={{ fill: "#7C7C8A", fontSize: useMonthly ? 11 : 12 }}
              angle={useMonthly ? -45 : 0}
              textAnchor={useMonthly ? "end" : "middle"}
              height={useMonthly ? 50 : 30}
              interval={0}
            />
            <YAxis
              yAxisId="price"
              tick={{ fill: "#7C7C8A", fontSize: 12 }}
              tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
            />
            <YAxis
              yAxisId="sqm"
              orientation="right"
              tick={{ fill: "#7C7C8A", fontSize: 12 }}
              tickFormatter={(v) => `${v}€`}
            />
            <Tooltip
              contentStyle={{
                background: "#FFFFFF",
                border: "1px solid #E8E8EA",
                borderRadius: "12px",
                color: "#1A1A2E",
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
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="Prix moyen"
              stroke="#CDEA68"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#CDEA68" }}
            />
            <Line
              yAxisId="sqm"
              type="monotone"
              dataKey="Prix/m²"
              stroke="#A855F7"
              strokeWidth={2.5}
              dot={{ r: 4, fill: "#A855F7" }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
