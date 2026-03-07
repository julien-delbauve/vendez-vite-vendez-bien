"use client";

import styles from "./DataFreshness.module.css";

interface Props {
  date: string;
}

export default function DataFreshness({ date }: Props) {
  if (!date) return null;

  const formatted = new Date(date).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <span className={styles.chip}>
      Dernière transaction enregistrée : {formatted}
    </span>
  );
}
