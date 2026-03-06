"use client";

import { useState } from "react";
import { Transaction } from "@/lib/types";
import styles from "./TransactionTable.module.css";

interface Props {
  transactions: Transaction[];
}

type SortKey = "date" | "price" | "pricePerSqm" | "surface";

export default function TransactionTable({ transactions }: Props) {
  const [sortKey, setSortKey] = useState<SortKey>("date");
  const [sortAsc, setSortAsc] = useState(false);
  const [page, setPage] = useState(0);
  const pageSize = 15;

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(false);
    }
    setPage(0);
  };

  const sorted = [...transactions].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case "date":
        cmp = a.date.localeCompare(b.date);
        break;
      case "price":
        cmp = a.price - b.price;
        break;
      case "pricePerSqm":
        cmp = a.pricePerSqm - b.pricePerSqm;
        break;
      case "surface":
        cmp = a.surface - b.surface;
        break;
    }
    return sortAsc ? cmp : -cmp;
  });

  const totalPages = Math.ceil(sorted.length / pageSize);
  const pageData = sorted.slice(page * pageSize, (page + 1) * pageSize);

  if (transactions.length === 0) {
    return (
      <div className={styles.card}>
        <h3 className={styles.title}>Transactions r\u00E9centes</h3>
        <p className={styles.empty}>Aucune transaction trouv\u00E9e</p>
      </div>
    );
  }

  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) return "";
    return sortAsc ? " \u2191" : " \u2193";
  };

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>
        Transactions r\u00E9centes
        <span className={styles.count}>({transactions.length})</span>
      </h3>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th onClick={() => handleSort("date")} className={styles.sortable}>
                Date{sortIndicator("date")}
              </th>
              <th>Adresse</th>
              <th>Type</th>
              <th
                onClick={() => handleSort("surface")}
                className={styles.sortable}
              >
                Surface{sortIndicator("surface")}
              </th>
              <th
                onClick={() => handleSort("price")}
                className={styles.sortable}
              >
                Prix{sortIndicator("price")}
              </th>
              <th
                onClick={() => handleSort("pricePerSqm")}
                className={styles.sortable}
              >
                Prix/m\u00B2{sortIndicator("pricePerSqm")}
              </th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((tx, i) => (
              <tr key={`${tx.date}-${tx.price}-${i}`}>
                <td>{tx.date}</td>
                <td className={styles.addressCell}>{tx.address}</td>
                <td>{tx.propertyType}</td>
                <td>{tx.surface > 0 ? `${tx.surface} m\u00B2` : "-"}</td>
                <td className={styles.priceCell}>
                  {Math.round(tx.price).toLocaleString("fr-FR")} \u20AC
                </td>
                <td>
                  {tx.pricePerSqm > 0
                    ? `${Math.round(tx.pricePerSqm).toLocaleString("fr-FR")} \u20AC`
                    : "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => setPage(Math.max(0, page - 1))}
            disabled={page === 0}
            className={styles.pageButton}
          >
            Pr\u00E9c\u00E9dent
          </button>
          <span className={styles.pageInfo}>
            {page + 1} / {totalPages}
          </span>
          <button
            onClick={() => setPage(Math.min(totalPages - 1, page + 1))}
            disabled={page >= totalPages - 1}
            className={styles.pageButton}
          >
            Suivant
          </button>
        </div>
      )}
    </div>
  );
}
