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
      value: `${formatPrice(averagePrice)} \u20AC`,
      detail: `${formatFull(averagePrice)} \u20AC`,
    },
    {
      label: "Prix m\u00B2 moyen",
      value: `${formatFull(averagePricePerSqm)} \u20AC`,
      detail: "par m\u00B2",
    },
    {
      label: "Prix m\u00E9dian",
      value: `${formatPrice(medianPrice)} \u20AC`,
      detail: `${formatFull(medianPrice)} \u20AC`,
    },
    {
      label: "Transactions",
      value: totalTransactions.toLocaleString("fr-FR"),
      detail: "sur la p\u00E9riode",
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
