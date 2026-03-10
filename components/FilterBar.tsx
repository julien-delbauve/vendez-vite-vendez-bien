"use client";

import { Transaction } from "@/lib/types";
import styles from "./FilterBar.module.css";

interface Props {
  transactions: Transaction[];
  selectedYear: number | null;
  selectedType: string | null;
  selectedRoom: string | null;
  onYearChange: (year: number | null) => void;
  onTypeChange: (type: string | null) => void;
  onRoomChange: (room: string | null) => void;
}

const ROOM_LABELS = ["T1", "T2", "T3", "T4", "T5+"];
const MIN_YEAR = 2023;

function roomLabel(rooms: number | undefined): string | null {
  if (!rooms || rooms < 1) return null;
  if (rooms >= 5) return "T5+";
  return `T${rooms}`;
}

export default function FilterBar({
  transactions,
  selectedYear,
  selectedType,
  selectedRoom,
  onYearChange,
  onTypeChange,
  onRoomChange,
}: Props) {
  const availableYears = Array.from(
    new Set(
      transactions
        .map((t) => parseInt(t.date.substring(0, 4)))
        .filter((y) => y >= MIN_YEAR)
    )
  ).sort();

  const availableTypes = Array.from(
    new Set(transactions.map((t) => t.propertyType).filter(Boolean))
  ).sort();

  const showRoomFilter = selectedType === "Appartement";

  const availableRoomLabels = showRoomFilter
    ? ROOM_LABELS.filter((label) =>
        transactions.some(
          (t) => t.propertyType === "Appartement" && roomLabel(t.rooms) === label
        )
      )
    : [];

  return (
    <div className={styles.filterBar}>
      <div className={styles.row}>
        <span className={styles.label}>Année</span>
        <div className={styles.pills}>
          {availableYears.map((year) => (
            <button
              key={year}
              className={`${styles.pill} ${selectedYear === year ? styles.active : ""}`}
              onClick={() => onYearChange(selectedYear === year ? null : year)}
            >
              {year}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.row}>
        <span className={styles.label}>Type de bien</span>
        <div className={styles.pills}>
          {availableTypes.map((type) => (
            <button
              key={type}
              className={`${styles.pill} ${selectedType === type ? styles.active : ""}`}
              onClick={() => {
                onTypeChange(selectedType === type ? null : type);
                onRoomChange(null);
              }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {showRoomFilter && availableRoomLabels.length > 0 && (
        <div className={styles.row}>
          <span className={styles.label}>Typologie</span>
          <div className={styles.pills}>
            {availableRoomLabels.map((label) => (
              <button
                key={label}
                className={`${styles.pill} ${selectedRoom === label ? styles.active : ""}`}
                onClick={() => onRoomChange(selectedRoom === label ? null : label)}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
