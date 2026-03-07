"use client";

import styles from "./PriceCards.module.css";

interface Props {
  averagePrice: number;
  medianPrice: number;
  averagePricePerSqm: number;
  totalTransactions: number;
}

function formatPrice(value: number): string {
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${Math.round(value / 1_000)}k`;
  }
  return Math.round(value).toLocaleString("fr-FR");
}

function formatFull(value: number): string {
  return Math.round(value).toLocaleString("fr-FR");
}

export default function PriceCards({
  averagePrice,
  medianPrice,
  averagePricePerSqm,
  totalTransactions,
}: Props) {
  const cards = [
    {
      label: "Prix moyen",
      value: `${formatPrice(averagePrice)} €`,
      detail: `${formatFull(averagePrice)} €`,
    },
    {
      label: "Prix m² moyen",
      value: `${formatFull(averagePricePerSqm)} €`,
      detail: "par m²",
    },
    {
      label: "Prix médian",
      value: `${formatPrice(medianPrice)} €`,
      detail: `${formatFull(medianPrice)} €`,
    },
    {
      label: "Transactions",
      value: totalTransactions.toLocaleString("fr-FR"),
      detail: "sur la période",
    },
  ];

  return (
    <div className={styles.grid}>
      {cards.map((card) => (
        <div key={card.label} className={styles.card}>
          <span className={styles.label}>{card.label}</span>
          <span className={styles.value}>{card.value}</span>
          <span className={styles.detail}>{card.detail}</span>
        </div>
      ))}
    </div>
  );
}
