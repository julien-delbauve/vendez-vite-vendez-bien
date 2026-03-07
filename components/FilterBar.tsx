"use client";

import { Transaction } from "@/lib/types";
import styles from "./FilterBar.module.css";

interface Props {
  transactions: Transaction[];
  selectedYears: number[];
  selectedTypes: string[];
  selectedRooms: string[];
  onYearsChange: (years: number[]) => void;
  onTypesChange: (types: string[]) => void;
  onRoomsChange: (rooms: string[]) => void;
}

const ROOM_LABELS = ["T1", "T2", "T3", "T4", "T5+"];

function roomLabel(rooms: number | undefined): string | null {
  if (!rooms || rooms < 1) return null;
  if (rooms >= 5) return "T5+";
  return `T${rooms}`;
}

export default function FilterBar({
  transactions,
  selectedYears,
  selectedTypes,
  selectedRooms,
  onYearsChange,
  onTypesChange,
  onRoomsChange,
}: Props) {
  const availableYears = Array.from(
    new Set(
      transactions
        .map((t) => parseInt(t.date.substring(0, 4)))
        .filter((y) => y > 0)
    )
  ).sort();

  const availableTypes = Array.from(
    new Set(transactions.map((t) => t.propertyType).filter(Boolean))
  ).sort();

  const showRoomFilter =
    selectedTypes.includes("Appartement") && selectedTypes.length === 1;

  const availableRoomLabels = showRoomFilter
    ? ROOM_LABELS.filter((label) =>
        transactions.some(
          (t) => t.propertyType === "Appartement" && roomLabel(t.rooms) === label
        )
      )
    : [];

  const toggleYear = (year: number) => {
    if (selectedYears.includes(year)) {
      onYearsChange(selectedYears.filter((y) => y !== year));
    } else {
      onYearsChange([...selectedYears, year]);
    }
  };

  const toggleType = (type: string) => {
    if (selectedTypes.includes(type)) {
      onTypesChange(selectedTypes.filter((t) => t !== type));
    } else {
      onTypesChange([...selectedTypes, type]);
    }
    // Clear room filter when type changes
    onRoomsChange([]);
  };

  const toggleRoom = (room: string) => {
    if (selectedRooms.includes(room)) {
      onRoomsChange(selectedRooms.filter((r) => r !== room));
    } else {
      onRoomsChange([...selectedRooms, room]);
    }
  };

  return (
    <div className={styles.filterBar}>
      <div className={styles.row}>
        <span className={styles.label}>Année</span>
        <button
          className={`${styles.pill} ${selectedYears.length === 0 ? styles.active : ""}`}
          onClick={() => onYearsChange([])}
        >
          Tous
        </button>
        {availableYears.map((year) => (
          <button
            key={year}
            className={`${styles.pill} ${selectedYears.includes(year) ? styles.active : ""}`}
            onClick={() => toggleYear(year)}
          >
            {year}
          </button>
        ))}
      </div>

      <div className={styles.row}>
        <span className={styles.label}>Type de bien</span>
        <button
          className={`${styles.pill} ${selectedTypes.length === 0 ? styles.active : ""}`}
          onClick={() => {
            onTypesChange([]);
            onRoomsChange([]);
          }}
        >
          Tous
        </button>
        {availableTypes.map((type) => (
          <button
            key={type}
            className={`${styles.pill} ${selectedTypes.includes(type) ? styles.active : ""}`}
            onClick={() => toggleType(type)}
          >
            {type}
          </button>
        ))}
      </div>

      {showRoomFilter && availableRoomLabels.length > 0 && (
        <div className={styles.row}>
          <span className={styles.label}>Typologie</span>
          <button
            className={`${styles.pill} ${selectedRooms.length === 0 ? styles.active : ""}`}
            onClick={() => onRoomsChange([])}
          >
            Tous
          </button>
          {availableRoomLabels.map((label) => (
            <button
              key={label}
              className={`${styles.pill} ${selectedRooms.includes(label) ? styles.active : ""}`}
              onClick={() => toggleRoom(label)}
            >
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
