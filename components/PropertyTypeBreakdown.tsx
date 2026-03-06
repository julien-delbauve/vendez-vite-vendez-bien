"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { PropertyTypeStats } from "@/lib/types";
import styles from "./ChartCard.module.css";

interface Props {
  data: PropertyTypeStats[];
}

const COLORS = [
  "var(--md-sys-color-primary)",
  "var(--md-sys-color-tertiary)",
  "var(--md-sys-color-secondary)",
  "#7c3aed",
];

export default function PropertyTypeBreakdown({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className={styles.card}>
        <h3 className={styles.title}>Types de biens</h3>
        <p className={styles.empty}>Pas assez de donn\u00E9es</p>
      </div>
    );
  }

  const chartData = data.map((d) => ({
    name: d.type,
    value: d.count,
    avgPrice: d.avgPrice,
    avgPricePerSqm: d.avgPricePerSqm,
  }));

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>Types de biens</h3>
      <div className={styles.chartContainer}>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={4}
              dataKey="value"
            >
              {chartData.map((_entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--md-sys-color-surface-container)",
                border: "1px solid var(--md-sys-color-outline-variant)",
                borderRadius: "8px",
                color: "var(--md-sys-color-on-surface)",
              }}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              formatter={(_value: any, _name: any, props: any) => {
                const payload = props.payload;
                return [
                  `${payload.value} transactions - Moy: ${Math.round(payload.avgPrice).toLocaleString("fr-FR")} \u20AC`,
                  payload.name,
                ];
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className={styles.statsList}>
        {data.map((item, i) => (
          <div key={item.type} className={styles.statRow}>
            <span
              className={styles.dot}
              style={{ background: COLORS[i % COLORS.length] }}
            />
            <span className={styles.statLabel}>{item.type}</span>
            <span className={styles.statValue}>
              {Math.round(item.avgPricePerSqm).toLocaleString("fr-FR")} \u20AC/m\u00B2
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
