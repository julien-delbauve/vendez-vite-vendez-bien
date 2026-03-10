"use client";

import {
  ComposedChart,
  Line,
  Bar,
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
        <ResponsiveContainer width="100%" height={380}>
          <ComposedChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#DDE9E6" />
            <XAxis
              dataKey="label"
              tick={{ fill: "#6B8A99", fontSize: useMonthly ? 10 : 12 }}
              angle={useMonthly ? -45 : 0}
              textAnchor={useMonthly ? "end" : "middle"}
              height={useMonthly ? 50 : 30}
              interval={useMonthly ? 2 : 0}
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
            <YAxis yAxisId="count" hide />
            <Tooltip
              contentStyle={{
                background: "#FFFFFF",
                border: "1px solid #DDE9E6",
                borderRadius: "12px",
                color: "#1B3A4B",
                fontFamily: "Space Grotesk",
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(value: any, name: any) => {
                const n = String(name);
                if (n === "Transactions") return [Number(value).toLocaleString("fr-FR"), n];
                if (n === "Prix/m²") return [`${Number(value).toLocaleString("fr-FR")} €/m²`, n];
                return [`${Number(value).toLocaleString("fr-FR")} €`, n];
              }}
            />
            <Legend />
            <Bar
              yAxisId="count"
              dataKey="Transactions"
              fill="#B0C4CE"
              fillOpacity={0.4}
              radius={[2, 2, 0, 0]}
              barSize={useMonthly ? 10 : 30}
            />
            <Line
              yAxisId="price"
              type="monotone"
              dataKey="Prix moyen"
              stroke="#4ECDC4"
              strokeWidth={2.5}
              dot={useMonthly ? false : { r: 4, fill: "#4ECDC4" }}
            />
            <Line
              yAxisId="sqm"
              type="monotone"
              dataKey="Prix/m²"
              stroke="#E8874A"
              strokeWidth={2.5}
              dot={useMonthly ? false : { r: 4, fill: "#E8874A" }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
