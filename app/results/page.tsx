"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { DVFResult } from "@/lib/types";
import Dashboard from "@/components/Dashboard";
import AddressSearch from "@/components/AddressSearch";
import styles from "./page.module.css";

function ResultsContent() {
  const searchParams = useSearchParams();
  const [data, setData] = useState<DVFResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const citycode = searchParams.get("citycode");
  const city = searchParams.get("city") || "";
  const lat = parseFloat(searchParams.get("lat") || "0");
  const lon = parseFloat(searchParams.get("lon") || "0");
  const address = searchParams.get("address") || "";

  useEffect(() => {
    if (!citycode) {
      setError("Aucune adresse s\u00E9lectionn\u00E9e");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`/api/dvf?citycode=${citycode}&city=${encodeURIComponent(city)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Erreur serveur");
        return res.json();
      })
      .then((result) => {
        if (result.error) throw new Error(result.error);
        setData(result);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [citycode, city]);

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <a href="/" className={styles.logo}>
          vendez<span className={styles.accent}>vite</span>.fr
        </a>
        <div className={styles.searchBar}>
          <AddressSearch />
        </div>
      </header>

      <div className={styles.content}>
        {loading && (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <p>Chargement des donn\u00E9es DVF...</p>
            <p className={styles.loadingDetail}>
              Requ\u00EAte en cours via le serveur MCP data.gouv.fr
            </p>
          </div>
        )}

        {error && (
          <div className={styles.error}>
            <h3>Erreur</h3>
            <p>{error}</p>
            <a href="/" className={styles.backLink}>
              Retour \u00E0 la recherche
            </a>
          </div>
        )}

        {data && !loading && (
          <Dashboard data={data} lat={lat} lon={lon} address={address} />
        )}
      </div>

      <footer className={styles.footer}>
        Source : Demandes de Valeurs Fonci\u00E8res (DVF) — Minist\u00E8re de l&apos;\u00C9conomie
        &middot; Donn\u00E9es via{" "}
        <a
          href="https://mcp.data.gouv.fr"
          target="_blank"
          rel="noopener noreferrer"
        >
          MCP data.gouv.fr
        </a>
      </footer>
    </main>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <main className={styles.main}>
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <p>Chargement...</p>
          </div>
        </main>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
